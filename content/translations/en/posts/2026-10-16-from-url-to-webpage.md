---
title: "From a URL to a rendered page: following a product page through the network"
date: 2026-10-16
summary: "Follow one HTTPS product page through DHCP, DNS, ARP, IP, NAT, TCP, TLS, and HTTP, then see how the browser turns the response into pixels. Includes a complete sequence diagram and address changes."
tags: [networking, web, computer-science]
selected: false
draft: false
---

Enter an address in a browser, press Enter, and a page appears. Along the way, the browser has to find a server, establish a connection, request files, and turn HTML, CSS, and images into something it can display.

When learning networking, DNS, TCP, and IP often appear in separate chapters. Their definitions may seem clear until they have to work together. Why do we need a MAC address when we already have an IP address? How does a DNS query itself leave the computer? Why does a TCP connection need a TLS handshake afterward?

This article follows a product page to connect those questions. Terms are explained when they first appear, and a complete sequence diagram follows the walkthrough. The final section adds background on bandwidth, sliding windows, and routing to explain the work each layer performs.

## Set up the example

We enter this URL:

```text
https://shop.example.com/products/42?color=blue#reviews
```

The page contains the name, price, image, and reviews of a blue mechanical keyboard. Assume the computer connects to a home router by Ethernet cable, uses IPv4, and reaches a website using HTTP/2 with TLS 1.3. There is no usable DNS or page cache and no existing connection. DNS uses ordinary UDP queries. This gives us one path to follow; a real browser may use caches, encrypted DNS, IPv6, or HTTP/3.

| Role | Example address |
|---|---|
| Computer | `192.168.1.10/24` |
| Home router's LAN interface, also the default gateway | `192.168.1.1` |
| Home router's public interface | `198.51.100.23` |
| Recursive DNS resolver | `192.0.2.53` |
| Web server, learned through DNS later | `203.0.113.80` |

The domain and public addresses are illustrative, not a deployed service. The router's LAN interface connects to the home network, while its public interface connects toward the provider. They are separate network interfaces.

Three identifiers matter here. An IP address provides network-layer addressing. A MAC address identifies a destination for delivery on the local link. A port distinguishes communication endpoints on a host. For example, `203.0.113.80:443` combines a destination IP with the usual HTTPS port. One server port can serve many connections at once.

## Layers apply different processing to the same data

Network layers divide communication into different kinds of work. This article uses the five-layer teaching model:

| Layer | Responsibility | Protocols or technologies used here |
|---|---|---|
| Application | Define the information applications exchange | DHCP, DNS, HTTP |
| Transport | Carry data between application endpoints | TCP, UDP |
| Network | Forward packets across networks | IP |
| Data link | Deliver frames across the current link | Ethernet, ARP |
| Physical | Encode bits as signals | Electrical signals on copper, light in fiber, and others |

A packet is a network-layer unit; a frame is a link-layer unit. Adding the information each layer needs is called encapsulation. The receiver processes it in the opposite direction. For unencrypted HTTP over TCP:

```text
Application:                            HTTP data
Transport:                 TCP header + HTTP data
Network:       IP header + TCP header + HTTP data
Link: frame header + IP header + TCP header + HTTP data + trailer
Physical: encode the bits as signals and transmit them
```

HTTPS also passes through TLS, which encrypts HTTP data before it enters the TCP byte stream. Here TLS sits between the application protocol and TCP; assigning it a rigid OSI layer number is not necessary.

The OSI model has seven layers, separately identifying presentation and session functions. A common four-layer TCP/IP model combines the bottom portion into a link layer. The boundaries differ, so specify the model before discussing where a protocol fits.

## DHCP has already supplied the computer's configuration

Before opening the page, the computer usually already has its IP address, subnet mask, default gateway, and DNS server address. DHCP can provide these automatically. A home router often also runs a DHCP server:

```text
Computer                         DHCP server
   |--- Discover: find a server ---->|
   |<-- Offer: proposed settings ----|
   |--- Request: select an offer --->|
   |<-- ACK: confirm assignment -----|
```

These steps are often called DORA. DHCP uses UDP port 68 on the client and 67 on the server. Before it has an IP address, the client can broadcast using source address `0.0.0.0`. An assigned address usually comes with a lease that needs renewal.

Our computer receives:

```text
IP:             192.168.1.10
Subnet mask:    255.255.255.0, also written /24
Default gateway: 192.168.1.1
DNS:            192.0.2.53
```

`/24` means the first 24 bits form the network prefix. The computer's subnet is `192.168.1.0/24`. Destinations outside it usually require forwarding through the default gateway.

DHCP runs when obtaining or updating network configuration, not for every page visit.

## Parse the URL and prepare a DNS query

After Enter is pressed, the browser identifies the URL's components:

| Component | Value in this example | Meaning |
|---|---|---|
| Scheme | `https` | Use HTTPS |
| Hostname | `shop.example.com` | Name of the target host |
| Port | Default `443` | Destination service port |
| Path | `/products/42` | Requested resource |
| Query | `color=blue` | Parameter sent to the server |
| Fragment | `reviews` | Browser navigation to the reviews section |

`#reviews` is not sent to the server as part of the URL. The server receives `/products/42?color=blue`; the browser handles the fragment after the page arrives.

The browser also checks whether a cache or existing connection can be used. Neither is available here, so it needs to resolve `shop.example.com` to an IP. DNS is the application-layer protocol for name resolution. An A record provides an IPv4 address; an AAAA record provides an IPv6 address.

Suppose the computer prepares this query:

```text
UDP source:      192.168.1.10:53000
UDP destination: 192.0.2.53:53
Question: the A record for shop.example.com
```

`53000` is a temporary port chosen for this exchange. `53` is the DNS service port. The query now faces the same problem as other network traffic: how does it reach an external resolver?

## ARP first finds the gateway's MAC address

The operating system checks its routing table. Since `192.0.2.53` is outside the local subnet, it selects next hop `192.168.1.1`. The next hop is the device that should receive the packet at this step; choosing it does not change the packet's final destination IP.

An Ethernet frame needs a destination MAC address. If the computer has no gateway entry in its ARP cache, it broadcasts a question:

```text
Computer → local network: who has IP 192.168.1.1?
Gateway → computer: 192.168.1.1 maps to my MAC address, GL.
Computer caches: 192.168.1.1 → GL
```

ARP resolves local IPv4 addresses to link-layer addresses. Its messages travel directly in Ethernet frames and have no TCP or UDP ports.

The outgoing DNS query now has two different destination identifiers:

```text
Destination IP:  192.0.2.53, the DNS server
Destination MAC: GL, the local gateway
```

The computer does not need the remote DNS server's MAC address. Delivery on that remote link is handled there. This also explains why “DNS first, then ARP” is not a fixed sequence: ARP can be a prerequisite for sending the DNS query.

## How the DNS query reaches the resolver

The query is encapsulated through the layers:

```text
DNS question
   ↓
UDP: 53000 → 53
   ↓
IPv4: 192.168.1.10 → 192.0.2.53
   ↓
Ethernet: computer MAC → gateway MAC
   ↓
Physical layer: signals sent over the cable
```

The gateway receives the frame, extracts the IP packet, and looks up where to forward it. Because the computer uses a private address, this example also uses network address translation, or NAT. When ports are translated too, NAPT is the more precise term. The router records a mapping for the DNS exchange:

```text
Internal endpoint                 Public endpoint
192.168.1.10:53000    ↔    198.51.100.23:63000
```

The resolver therefore sees source endpoint `198.51.100.23:63000`. When the reply reaches the router, the mapping directs it back to the computer. NAT translates addresses and ports; it does not encrypt the content.

Ordinary routers use the destination IP to look up the next hop. Each router hop decreases IPv4's TTL so that packets cannot circulate indefinitely. The router also encapsulates the packet for the outgoing link. On Ethernet, the destination MAC identifies the current next hop.

An ordinary layer-two switch within a LAN generally forwards the frame without rewriting its source and destination MAC addresses as a router crossing links would.

The resolver first checks its own cache. Assuming it also misses, it proceeds through the hierarchy:

```text
Computer
  | query shop.example.com
  ↓
Recursive resolver
  ├─ Root server → referral to .com name servers
  ├─ .com server → referral to example.com authorities
  └─ example.com authority → answer: 203.0.113.80
```

These are new queries made by the resolver using its own network endpoints. The client asks the resolver for a final result; the resolver follows referrals through iterative queries. The answer returns to the computer and can be cached according to its DNS TTL. This TTL is a cache lifetime, unlike the TTL in an IP header.

The name itself is hierarchical:

```text
shop.example.com.
             .  root
           com  top-level domain
       example  next-level domain
          shop  specific name
```

DNS also stores CNAME aliases, MX mail servers, NS authoritative servers, TXT text, and other records. Reverse lookups commonly use PTR records; modern SPF mail policies are published in TXT records. DNS can use both UDP and TCP. This walkthrough simply follows an ordinary UDP query.

## TCP opens a connection and NAT records another mapping

The browser now knows the website is at `203.0.113.80:443`. The system selects temporary TCP port `51514` and prepares a connection:

```text
192.168.1.10:51514 → 203.0.113.80:443
```

TCP is a connection-oriented transport protocol that provides a reliable, ordered, bidirectional byte stream. A connection consists of state maintained at the endpoints, such as sequence numbers and windows. It does not reserve a dedicated physical line along the route. UDP sends separate datagrams and does not itself provide TCP's retransmission or ordering guarantees.

First, consider the three-way handshake on its own:

![A TCP three-way handshake with client sequence number 100 and server sequence number 500, followed by acknowledgments of each initial sequence number.](/blog/from-url-to-webpage/handshake-basics-en.svg)

Figure 1: Smaller numbers make SYN, SYN+ACK, and ACK easier to read. [Full-size diagram](/blog/from-url-to-webpage/handshake-basics-en.svg) · [Mermaid source](/blog/from-url-to-webpage/handshake-basics-en.mmd)

A SYN consumes one sequence number, so its acknowledgment adds one. The third message lets the server know the client received its connection-establishment information.

For our product page, the router creates another NAT mapping for TCP. This is a different exchange from the earlier UDP query:

```text
Computer's internal endpoint       Public-facing endpoint
192.168.1.10:51514    ↔    198.51.100.23:62001
```

| Location | Source endpoint | Destination endpoint |
|---|---|---|
| Inside the home network | `192.168.1.10:51514` | `203.0.113.80:443` |
| After entering the public network | `198.51.100.23:62001` | `203.0.113.80:443` |
| Response on the public network | `203.0.113.80:443` | `198.51.100.23:62001` |
| Response back on the home network | `203.0.113.80:443` | `192.168.1.10:51514` |

The walkthrough uses the following sequence numbers, with intervening gateways and routers collapsed:

![The product page's TCP handshake, using initial client sequence 1000 and server sequence 8000. Every message travels through the underlying network.](/blog/from-url-to-webpage/handshake-example-en.svg)

Figure 2: The handshake in this visit. Every arrow uses IP, link, and physical layers. [Full-size diagram](/blog/from-url-to-webpage/handshake-example-en.svg) · [Mermaid source](/blog/from-url-to-webpage/handshake-example-en.mmd)

After TCP connects, the server has not yet proved its website identity to the browser, and HTTPS encryption has not been established. TLS handles that work.

## TLS verifies the server and establishes traffic keys

TLS protects transmitted content. This example uses a full certificate-based TLS 1.3 handshake:

```text
Browser                                        Server
   |--- ClientHello ------------------------------>|
   |    Algorithms, ephemeral key exchange data    |
   |<-- ServerHello -------------------------------|
   |<-- Encrypted extensions, certificate,          |
   |    signature proof, Finished -----------------|
   |                                               |
   | Validate certificate and handshake messages   |
   |--- Finished --------------------------------->|
   |<--------- Encrypted application data -------->|
```

The browser checks whether the certificate covers `shop.example.com`, whether the chain leads to a trusted root, and whether validity dates and other conditions are satisfied. A handshake signature also proves that the server holds the corresponding private key.

Both endpoints use ephemeral key exchange information to compute a shared secret and derive traffic keys. Subsequent page content uses symmetric encryption and integrity protection. The certificate is not used to encrypt the entire page directly with public-key encryption.

ALPN negotiates the application protocol during the handshake; here it selects `h2`, meaning HTTP/2. SNI identifies the target server name during TLS negotiation. These extensions serve different purposes.

## HTTP identifies the page and the server creates a response

HTTP defines the meaning of requests and responses. After HTTP/2 initialization, the browser sends a request. The following is a readable field representation; actual HTTP/2 traffic uses binary frames:

```text
:method: GET
:scheme: https
:authority: shop.example.com
:path: /products/42?color=blue
accept: text/html
accept-encoding: gzip, br
```

GET retrieves a resource. The path identifies product 42, and the query selects blue. The application might read product data and generate this HTML:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="/assets/site.css">
  <script defer src="/assets/product.js"></script>
</head>
<body>
  <h1>Blue mechanical keyboard</h1>
  <p class="price">CNY 299</p>
  <img src="/images/keyboard-blue.webp"
       width="600" height="400" alt="Blue mechanical keyboard">
  <section id="reviews">Customer reviews</section>
</body>
</html>
```

The response includes a status and content information, such as `200` and `content-type: text/html; charset=utf-8`. Brotli-compressed content also carries `content-encoding: br`. The browser decrypts it, decompresses according to the content encoding, and then parses the HTML.

The outgoing HTTP/2 data passes through these layers:

```text
HTTP/2 HEADERS, DATA, and other frames
   ↓ TLS encryption and integrity protection
TLS bytes
   ↓ TCP organizes the stream into segments
TCP segments
   ↓ IP encapsulation and addressing
IP packets
   ↓ Encapsulation for the current link
Ethernet frames → physical signals
```

A frame carrying application data conceptually contains:

```text
[Ethernet header][IPv4 header][TCP header][part of the TLS byte stream][FCS]
```

FCS is Ethernet's frame error-detection information. HTTP/2 frames, TLS records, and TCP segments need not have matching boundaries. A single HTTP response may span many TCP segments. An HTTP/2 frame is an application-layer structure, distinct from an Ethernet frame.

The server processes incoming data in reverse: the link layer checks the frame, IP handles the packet, TCP supplies continuous bytes, TLS verifies and decrypts them, and HTTP parses the request before handing it to the application. A real website may terminate HTTPS at a CDN or reverse proxy before reaching a backend. This example combines the HTTPS endpoint and application for clarity.

## What TCP does when part of the response is lost

IP does not guarantee delivery or arrival order. Suppose the response contains four segments and the second is lost:

```text
Sent:     segment 1, segment 2, segment 3, segment 4
Received: segment 1,            segment 3, segment 4
```

TCP can buffer the later data, but the gap needs to be filled. The sender retransmits using acknowledgments, loss detection, or a timeout. Once the gap is repaired, the receiver continues delivering contiguous bytes upward.

TCP sequence numbers count bytes. For an independent example, a segment with `SEQ=1000` carrying 500 bytes can be acknowledged with `ACK=1500` after contiguous receipt. This means byte 1500 is expected next. These numbers are separate from the earlier handshake example.

The amount sent cannot grow without limit. The receive window, `rwnd`, advertises the range the receiver permits. The congestion window, `cwnd`, is a sender-maintained limit based on network feedback. Outstanding data is mainly bounded by `min(rwnd, cwnd)`; calculating how much new data can be sent also requires subtracting data already in flight.

A TCP acknowledgment does not mean the browser has displayed the content. It acknowledges receipt by the receiving TCP endpoint. TCP also has no application-message boundaries: two `send()` calls need not match two `recv()` calls. The higher-level protocol defines message boundaries.

## The browser parses HTML while requesting more resources

The browser can start building the DOM from HTML that has already arrived. The DOM is the document's in-memory structure: headings, paragraphs, images, and their parent-child relationships.

When the parser discovers the stylesheet, script, and image, it requests them:

```text
GET /assets/site.css
GET /assets/product.js
GET /images/keyboard-blue.webp
```

These requests can reuse the existing HTTP/2 connection. HTTP/2 distinguishes request-response exchanges using streams, whose frames can interleave:

```text
One TCP / TLS connection:
CSS data → image data → JS data → image data → CSS data …
```

This differs from earlier connection patterns:

```text
New connections: connect → request → response; connect again → request → response
Persistent, serial: connect once → request A → response A → request B → response B
HTTP/1.1 pipelining: requests A and B can be sent before replies, but replies stay ordered
HTTP/2: frames from multiple streams can interleave
```

HTTP/2 still depends on one TCP byte stream, so missing bytes can make multiple streams wait. HTTP/3 uses QUIC over UDP, with reliability and related functions provided by QUIC, reducing this cross-stream transport head-of-line blocking. Opening a web page therefore does not always begin with a TCP connection; that applies to the path chosen here.

## How the browser turns data into pixels

HTML describes document structure, CSS supplies styles, and JavaScript can change both. The browser still needs to calculate positions, produce drawing instructions, and turn the result into pixels:

![Browser rendering flow: HTML builds the DOM, CSS supplies computed styles, then layout, painting, rasterization, and compositing produce the page. JavaScript can modify the DOM and styles.](/blog/from-url-to-webpage/rendering-en.svg)

Figure 3: The main dependencies. Downloading, parsing, and rendering overlap, and some steps repeat. [Full-size diagram](/blog/from-url-to-webpage/rendering-en.svg) · [Mermaid source](/blog/from-url-to-webpage/rendering-en.mmd)

| Stage | Work on this product page |
|---|---|
| Build the DOM | Identify the heading, price, image, and reviews |
| Compute styles | Determine heading size, price color, and image styles |
| Layout | Calculate each element's position and dimensions |
| Paint | Generate instructions for text, backgrounds, borders, and other visuals |
| Rasterize and composite | Produce pixels and combine them into the final image |

A DOM element need not appear on screen. For example, `display: none` excludes it from normal layout. The browser also need not wait for every resource before showing anything; text can appear before images.

Our script uses `defer`, so downloading it does not block HTML parsing, and it normally executes after parsing. The image specifies dimensions, allowing the browser to reserve space and reduce layout shifts when it arrives. Once the reviews element is available, the browser can also navigate to `#reviews`.

After the page appears, the script might fetch stock information:

```javascript
fetch("/api/stock?product=42")
  .then(response => response.json())
  .then(data => {
    // Update the page with the stock result.
  });
```

This is another HTTP request, usually able to reuse the connection. When JSON arrives, the script changes the DOM and the browser performs any necessary style, layout, or painting work.

The first visible content, `DOMContentLoaded`, `load`, and the moment application data is ready are separate milestones. The connection does not need to close before the page can appear.

## Put the whole process in one sequence diagram

The diagram expands DNS and the TCP handshake hop by hop. TLS and HTTP use end-to-end arrows, but their traffic still traverses the same gateway and routing path.

| MAC label in the diagram | Interface |
|---|---|
| C | Computer's network interface |
| GL / GW | Home router's LAN / WAN interfaces |
| I | Provider's first-hop router interface |
| RD / RS | Last-hop router interfaces on the DNS / web server links |
| D / S | DNS / web server interfaces |

![Complete sequence covering URL parsing, ARP, recursive DNS resolution, NAT, the TCP handshake, TLS, HTTP/2, resource loading, and rendering, with IP, MAC, and port changes along the path.](/blog/from-url-to-webpage/full-sequence-en.svg)

Figure 4: Read from top to bottom in time order. Open the full-size version to inspect the address labels. [Complete full-size diagram](/blog/from-url-to-webpage/full-sequence-en.svg) · [Mermaid source](/blog/from-url-to-webpage/full-sequence-en.mmd)

| Field | Leaving the computer | After NAT into the public network | Ordinary routing | Returning to the home network |
|---|---|---|---|---|
| IP | Source is the computer's private IP | Source becomes the router's public IP | Addresses normally stay unchanged; TTL decreases | Destination becomes the computer's private IP |
| TCP port | Source port 51514 | Source changes to 62001 | Unchanged | Destination changes back to 51514 |
| MAC | C → GL | GW → I | Re-encapsulated at every router hop | Final hop: GL → C |

## How the connection closes

The browser can keep the connection for later resources. During a normal close, TCP's two sending directions end separately. A common exchange is:

```text
Client → server: FIN, no more data to send
Server → client: ACK, acknowledged

The server can still send its remaining data …

Server → client: FIN, no more data to send either
Client → server: ACK, acknowledged
```

This is the usual four-message close. ACK and FIN can be combined when appropriate, so the packet count is not fixed. After sending FIN, an endpoint can still receive in the other direction; this is a half-close.

Common state paths are:

```text
Active open: CLOSED → SYN-SENT → ESTABLISHED
Passive open: LISTEN → SYN-RECEIVED → ESTABLISHED

Active close: ESTABLISHED → FIN-WAIT-1 → FIN-WAIT-2 → TIME-WAIT → CLOSED
Passive close: ESTABLISHED → CLOSE-WAIT → LAST-ACK → CLOSED
```

`CLOSE-WAIT` means the peer's FIN has arrived and the local application has yet to close its sending direction. `TIME-WAIT` retains state to answer a retransmitted FIN and reduce interference from old segments in later connections. The classic interval is 2MSL. MSL means maximum segment lifetime, not one round-trip time.

## A few more networking foundations

The visit has now crossed all five layers. The following concepts explain why those layers need their particular mechanisms.

### Physical layer: rate, bandwidth, and propagation delay

Homes and offices commonly contain local area networks, or LANs. Networks connecting distant areas are wide area networks, or WANs. A computer might begin on twisted-pair cable or Wi-Fi, then cross links using fiber and other media. Wi-Fi is an access technology; joining it does not automatically provide Internet access.

Twisted pair, coaxial cable, and optical fiber are common wired media. Wireless communication also includes microwave, infrared, and satellite links. Frequency-division multiplexing, FDM, shares a channel by frequency bands. Time-division multiplexing, TDM, shares it by time slots. Wavelength-division multiplexing, WDM, uses different wavelengths in fiber.

Carrier frequency and data rate are different quantities. In a vacuum, wavelength and frequency satisfy $\lambda f=c$; in a medium, use the corresponding propagation speed. Operating at a frequency in GHz does not imply the same numerical rate in Gbit/s.

The Shannon formula gives the theoretical capacity of a particular noisy-channel model:

$$
C=B\log_2(1+S/N)
$$

$B$ is measured in Hz, $C$ in bit/s, and $S/N$ is a linear signal-to-noise power ratio. With $B=3000$ Hz and $S/N=1000$, capacity is about 29.9 kbit/s. A 30 dB signal-to-noise ratio corresponds to a linear ratio of 1000 because $\mathrm{SNR}_{dB}=10\log_{10}(S/N)$.

Actual throughput also accounts for protocol overhead and other costs. Bandwidth and latency differ too: a higher transmission rate reduces the time needed to send a large block, but cannot eliminate signal propagation time.

### Link layer: frame boundaries and sliding windows

A receiver needs to identify frame boundaries in a continuous bit stream. Approaches include a length field, flag bytes with escaping, flag bits with bit stuffing, and special physical coding symbols.

For example, a protocol using `01111110` as a boundary marker can insert a `0` after every five consecutive `1` bits in the data. The receiver removes the inserted zeros, preventing payload data from being mistaken for a boundary.

A reliable link protocol can use a sliding window so the sender need not stop after every frame to await an acknowledgment:

```text
Stop-and-wait: send 0 → wait for ACK → send 1 → wait for ACK

Window size 4: frames 0, 1, 2, 3 may be sent
After ACK of 0: the window moves to 1, 2, 3, 4
```

Suppose frame 2 is damaged:

```text
Sent: 0, 1, 2, 3, 4, 5
            ×
Go-Back-N: usually discard later out-of-order frames; resend from the missing frame
Selective repeat: buffer 3, 4, 5; resend only missing or damaged frames
```

Selective repeat reduces repeated transmission but needs more buffering and state. Not every link provides reliable delivery: an Ethernet FCS check does not mean Ethernet automatically retransmits a frame. TCP windows and retransmission operate end to end at the transport layer.

For a link with rate $R$ and round-trip time RTT, filling the path typically requires accommodating about $R\times RTT$ of data in flight. This is the bandwidth-delay product.

### Network layer: prefixes, routing, and tunnels

An IPv4 address has 32 bits. Modern routing uses CIDR prefixes such as `/24`; the old A, B, and C address classes are not enough to infer a subnet. An ordinary `/24` broadcast subnet has 256 addresses, typically 254 available for hosts. Special uses and other prefix lengths require their own treatment.

```text
Host:      192.168.8.34/24
Mask:      255.255.255.0
Network:   192.168.8.0
Broadcast: 192.168.8.255

Network address = IP address bitwise AND subnet mask
```

Contiguous, aligned prefixes can be aggregated. The eight `/24` prefixes from `192.168.8.0/24` through `192.168.15.0/24` can be represented by `192.168.8.0/21`:

```text
Third octet:
8  = 00001000
15 = 00001111
     00001xxx: five shared prefix bits

16 bits in the first two octets + 5 bits = /21
```

Aggregating routes does not automatically merge eight LANs into one LAN. Forwarding normally selects the longest prefix matching the destination address.

Routing protocols help routers maintain paths. Distance-vector routing computes the next hop from distances reported by neighbors. Link-state routing distributes adjacency and cost information, after which routers compute shortest paths. For example, J can reach C through A, I, H, or K:

| Neighbor | Cost to neighbor | Neighbor's reported cost to C | Total |
|---|---|---|---|
| A | 8 | 25 | 33 |
| I | 10 | 18 | 28 |
| H | 12 | 19 | 31 |
| K | 6 | 36 | 42 |

J therefore selects I. The distance-vector calculation is $D_x(y)=\min_v\{c(x,v)+D_v(y)\}$. OSPF is a link-state protocol used within an autonomous system. BGP commonly exchanges routes between autonomous systems; administrative and business policies affect its choices, so it need not select the physically shortest or lowest-latency path. An autonomous system is a group of networks operating under a common routing policy.

The IP header's `Protocol` field identifies the upper-layer protocol: 6 for TCP and 17 for UDP, for example. Ports belong in TCP/UDP headers. The minimum IPv4 header is 20 bytes, and its checksum covers only the header. Fragmentation fields support fragmentation and reassembly. UDP has a fixed 8-byte header; TCP's minimum header is 20 bytes.

A tunnel adds an outer encapsulation around an existing packet. For example, an IPv6 packet can cross an IPv4 network this way:

```text
Before the tunnel:                IPv6 packet
Inside the tunnel:  IPv4 header + IPv6 packet
After the tunnel:                 IPv6 packet
```

Whether a tunnel encrypts traffic depends on the protocol. SNAT changes the source address; DNAT changes the destination. A public endpoint such as `203.0.113.5:8080` can map to internal service `10.0.0.10:80`. Replies in our walkthrough instead use reverse translation based on existing NAT state.

### Transport layer: flow control and congestion control

Flow control protects a receiver from being overwhelmed. Congestion control adjusts the load placed on the network. Classic TCP congestion control begins with slow start and moves to congestion avoidance at a threshold:

```text
Slow start, illustrated:          1 → 2 → 4 → 8
Congestion avoidance, illustrated: 8 → 9 → 10 → 11
```

Under ideal conditions, slow start roughly doubles the window per RTT. The initial value above is only a teaching example. A timeout usually triggers a large reduction. Classic fast retransmit treats three duplicate ACKs as a loss indication, and fast recovery continues transmission at a reduced rate. Implementations may use other congestion-control or loss-detection algorithms.

Ports are service conventions, not hard restrictions. Common examples are SSH 22, DNS 53, HTTP 80, and HTTPS 443. FTP control uses 21; active-mode FTP commonly uses server data port 20. Other examples include SMTP 25, POP3 110, IMAP 143, RTSP 554, and IPP 631. A port number alone does not establish whether a protocol is secure or traffic is trustworthy.

### Application layer: HTTP methods, status codes, and caching

GET retrieves a representation. HEAD requests similar response information without response content. POST submits data for the resource to process. PUT creates or replaces the target resource's state. DELETE requests removal of the relevant association. OPTIONS queries communication options, CONNECT establishes a tunnel, and TRACE requests a diagnostic loopback. POST is not limited to creation, and PUT is not limited to storing web pages.

The first status-code digit identifies the class: 1xx is informational, 2xx successful, 3xx includes redirection and conditional-request results, 4xx indicates client-related problems, and 5xx indicates server processing failure. `401` means valid authentication credentials are missing, `403` means the request is refused, and `404` means the resource was not found.

Headers attach more information to requests or responses. `Content-Type` identifies the content type; `Content-Encoding` identifies its encoding. `Cookie` and `Set-Cookie` carry and set cookies. `Accept` describes types the client can receive. Requests can also have `Content-Type` and `Content-Length`; those fields are not restricted to responses.

If the browser cached a resource with version identifier `"v3"`, it can validate it with a conditional request. The same semantics are shown below in HTTP/1.1's text format:

```http
GET /index.html HTTP/1.1
Host: example.com
If-None-Match: "v3"

```

If the resource is unchanged, the server can return:

```http
HTTP/1.1 304 Not Modified
ETag: "v3"
Cache-Control: max-age=60

```

A 304 still involves a network request; it avoids transferring the complete content again. If a cached response is still fresh, the browser may use it directly and skip even that validation request.

## Further reading

- [DHCP: RFC 2131](https://www.rfc-editor.org/rfc/rfc2131.html)
- [ARP: RFC 826](https://www.rfc-editor.org/rfc/rfc826.html)
- [DNS structure and queries: RFC 1034](https://www.rfc-editor.org/rfc/rfc1034.html)
- [NAT and NAPT: RFC 3022](https://www.rfc-editor.org/rfc/rfc3022.html)
- [CIDR: RFC 4632](https://www.rfc-editor.org/rfc/rfc4632.html)
- [TCP: RFC 9293](https://www.rfc-editor.org/rfc/rfc9293.html); [classic congestion control: RFC 5681](https://www.rfc-editor.org/rfc/rfc5681.html)
- [TLS 1.3: RFC 8446](https://www.rfc-editor.org/rfc/rfc8446.html)
- [HTTP semantics: RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html); [HTTP/2: RFC 9113](https://www.rfc-editor.org/rfc/rfc9113.html); [HTTP/3: RFC 9114](https://www.rfc-editor.org/rfc/rfc9114.html)
- [MDN: how browsers populate a page](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work#render). This article uses its parsing and rendering explanation; handshake and transport details follow the corresponding RFCs.
- [IANA service-port registry](https://www.iana.org/assignments/service-names-port-numbers?search=554); [the SPF TXT-record requirement](https://www.rfc-editor.org/rfc/rfc7208.html#section-3.1)

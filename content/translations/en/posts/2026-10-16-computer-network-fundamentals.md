---
title: "Revisiting computer networking"
date: 2026-10-16
summary: "Review network layers, physical transmission, framing and sliding windows, IP and routing, TCP/UDP, DNS, and HTTP. Then follow an HTTPS request to see how the layers cooperate and how IP addresses, MAC addresses, and ports change."
tags: [networking, web, computer-science]
selected: false
draft: false
---

Computer networking examines how application data travels as signals, crosses individual links and networks, and eventually reaches an application on another computer. Understanding that process starts with the responsibility of each layer, followed by its addresses, message formats, and control mechanisms.

The sections below start with basic concepts and work through each network layer. An HTTPS product-page example at the end places the protocols on one timeline, including TLS and browser rendering to show how received network data becomes a page.

| Topic | Main questions |
|---|---|
| Basic concepts | Why use layers? How is data encapsulated? |
| Physical layer | How do bits become signals? What limits capacity? |
| Data link layer | How are frame boundaries, acknowledgments, and retransmissions handled? |
| Network layer | How does IP addressing work? How do routers choose a next hop? |
| Transport layer | How are connections distinguished, bytes ordered, and sending controlled? |
| Application layer | How does DNS resolve names? How does HTTP express requests and responses? |

For a first reading, work through these six sections before the supporting example. Terms, formulas, and illustrations are explained where they appear.

## 1. Basic concepts: layers and data flow

### Layering and encapsulation

When a browser requests an image, several questions arise: how to express the request, what to do if data is lost, where the server is, which device receives the next hop, and how to transmit signals on a cable.

Layering separates those responsibilities:

| Five-layer teaching model | Responsibility | Examples |
|---|---|---|
| Application | Define how applications exchange information | HTTP, DNS |
| Transport | Transfer data between application endpoints | TCP, UDP |
| Network | Forward packets across networks toward a destination | IP, routing |
| Data link | Deliver frames across an individual link | Ethernet, Wi-Fi link functions |
| Physical | Transmit signals representing bits through a medium | Electrical signals, light, radio waves |

Other common layering models are:

- The seven-layer OSI model adds presentation and session layers between application and transport.
- The four-layer TCP/IP model uses application, transport, internet, and link layers.

Presentation concerns include encoding and data representation; session concerns include establishing and managing sessions. TCP/IP does not give these functions separate layers, but that does not mean the functions disappear.

The sections below follow the five-layer model above.

Adding control information at each layer is called encapsulation; the receiver processes the layers in reverse. For unencrypted HTTP over TCP, the sender adds:

```text
Application:                            HTTP data
Transport:                 TCP header + HTTP data
Network:       IP header + TCP header + HTTP data
Link: frame header + IP header + TCP header + HTTP data + trailer
Physical: encode these bits as signals and transmit them
```

The receiver processes these layers in the opposite direction.

Peers at the same layer follow the same protocol, which is often called logical communication. The actual data still travels through the lower layers to reach the other endpoint.

When learning protocol relationships, first ask what depends on what: HTTP can depend on TCP, and TCP on IP. There is no need to memorize every abbreviation at the beginning.

### LANs, WANs, and access networks

- A LAN, or local area network, connects a limited area such as a home or office.
- A MAN, or metropolitan area network, covers a city-scale area.
- A WAN, or wide area network, connects more distant regions.
- An access network connects users to a provider's network.

A computer joining home Wi-Fi and then reaching a distant server through its provider moves from a local network into a wider network.

Wi-Fi is an access technology; the Internet is a collection of interconnected networks. Joining Wi-Fi establishes access to that wireless network, but does not by itself establish Internet connectivity.

### Connection-oriented and connectionless service

| Comparison | Connection-oriented | Connectionless |
|---|---|---|
| Before communication | Establish a connection | No connection establishment required |
| State | Endpoints maintain connection state | Messages are handled independently |
| Examples | TCP | UDP, IP |
| Order and reliability | Depend on the protocol; TCP provides a reliable, ordered byte stream | UDP and IP do not themselves guarantee reliable, ordered delivery |

A TCP connection consists of state such as sequence numbers, windows, and connection status maintained at both ends. It does not reserve a dedicated cable between the machines.

TCP ordering concerns the data eventually delivered to the application. Underlying IP packets can still arrive out of order; TCP puts the bytes back in order.

### Five recurring protocol concerns

| Concern | Meaning |
|---|---|
| Addressing | Identify where data comes from and where it is going |
| Error control | Detect corruption or loss, then correct or retransmit as the protocol specifies |
| Flow control | Keep a sender from overwhelming the receiver's buffers |
| Multiplexing and demultiplexing | Share resources among communications and deliver received data to the correct endpoints |
| Routing | Determine a path toward the destination |

These concerns can occur at different layers, but their scope differs. Link-layer mechanisms operate across a link; TCP operates end to end.

## 2. Physical layer: turning bits into signals

### Shannon capacity: the limit of a noisy channel

The formula is:

$$
C=B\log_2\left(1+\frac{S}{N}\right)
$$

Its terms are:

- $C$: theoretical channel capacity, in bit/s.
- $B$: channel bandwidth, in Hz.
- $S/N$: the ratio of signal power to noise power, expressed as a linear ratio.

Suppose:

$$
B=3000\text{ Hz},\qquad S/N=1000
$$

Then:

$$
C=3000\log_2(1001)\approx 29900\text{ bit/s}
$$

That is approximately $29.9\text{ kbit/s}$.

If the signal-to-noise ratio is given in decibels, convert it first:

$$
\mathrm{SNR}_{dB}=10\log_{10}(S/N)
$$

For example, $30\text{ dB}$ corresponds to $S/N=1000$.

Increasing spectral bandwidth increases capacity. Increasing signal-to-noise ratio also helps, but its contribution is logarithmic. The formula gives a theoretical limit for a particular channel model; application throughput also depends on coding, protocol overhead, and other factors.

Bandwidth here is measured in Hz. In everyday descriptions such as “100 Mbps broadband,” bandwidth usually refers to a data rate instead. The units distinguish them.

### Wired and wireless transmission media

| Medium | Characteristics and uses |
|---|---|
| Twisted pair | Copper wires twisted together to reduce interference; common in Ethernet cabling |
| Coaxial cable | A central conductor with shielding; used in systems such as cable television |
| Fiber optics | Carries light, offers high capacity and long reach, and is immune to electromagnetic interference |
| Microwave | Wireless transmission; directional links must account for line of sight and obstructions |
| Infrared | Common in short-range communication, such as remote controls |
| Communication satellites | Broad coverage; propagation delay depends on orbital altitude |

Wavelength and frequency are related by:

$$
\lambda f=c
$$

In a vacuum, wavelength multiplied by frequency equals the speed of light. Within a medium, use the corresponding propagation speed $v$.

Carrier frequency is different from data rate. A radio signal operating in a GHz band does not necessarily carry the same numerical rate in Gbit/s.

### Frequency, time, and wavelength division multiplexing

- FDM, frequency division multiplexing, assigns different frequency bands to different users. Radio stations using separate frequencies are one example.
- TDM, time division multiplexing, assigns time slots so users take turns using a channel.
- WDM, wavelength division multiplexing, carries multiple optical signals with different wavelengths through the same fiber.

These methods divide the transmission resource by frequency, time, and optical wavelength respectively.

## 3. Data link layer: framing and reliable delivery

### Framing: recognizing boundaries

A receiver uses protocol conventions to recognize the beginning and end of each frame in an incoming bit stream. Four common framing methods are:

| Method | Mechanism | Consideration |
|---|---|---|
| Byte count | Record the frame length | A corrupted length can disrupt boundary recognition |
| Flag bytes with byte stuffing | Mark boundaries with special bytes and escape matching bytes in the payload | The receiver must undo the escaping |
| Flag bits with bit stuffing | Mark boundaries with a bit pattern and alter potentially conflicting payload patterns | The receiver removes the inserted bits |
| Physical-layer coding violations | Use special symbols that cannot occur as ordinary data in the encoding scheme | Depends on the physical encoding |

For example, a protocol might mark boundaries with `01111110`. To keep payload data from accidentally matching it, the sender inserts a `0` after every five consecutive `1` bits in the data. The receiver removes that inserted `0`.

Bit stuffing keeps payload content from being mistaken for a boundary.

### Sliding windows: allowing multiple frames in flight

If a sender waits for an acknowledgment after every frame:

```text
Send 0 → wait for acknowledgment → send 1 → wait for acknowledgment → …
```

it can spend much of its time waiting on a link with a long round-trip delay.

A sliding window allows several frames to be sent but not yet acknowledged. For a window of four:

```text
Currently allowed to send: 0, 1, 2, 3

After frame 0 is acknowledged:

The window advances to:    1, 2, 3, 4
```

The window limits unacknowledged data. As acknowledgments arrive, older data leaves the window and new data becomes eligible for transmission.

For link rate $R$ and round-trip time RTT, keeping the link busy typically requires room for approximately:

$$
R\times RTT
$$

of data in flight. This is the bandwidth-delay product.

### Go-Back-N and selective repeat

The two approaches differ in how the receiver handles later frames and which frames the sender must retransmit.

Suppose the sender transmits:

```text
0, 1, 2, 3, 4, 5
```

and frame 2 is corrupted:

| Behavior | Go-Back-N | Selective repeat |
|---|---|---|
| Receiver gets later frames 3, 4, and 5 | Usually discards them | Buffers them |
| Retransmission | Resends unacknowledged frames starting at the gap | Resends only missing or damaged frames |
| Receiver buffering | Lower | Higher |
| Implementation complexity | Lower | Higher |
| Wasted bandwidth after loss | Higher | Lower |

Selective repeat permits out-of-order reception and buffering while still delivering frames upward in order once the gap has been filled.

## 4. Network layer: addressing, routing, and forwarding

### Distance vector: updating routes from neighbors' distances

Each router keeps its cost to each destination and exchanges that information with its neighbors.

The central equation is:

$$
D_x(y)=\min_v\{c(x,v)+D_v(y)\}
$$

To reach $y$ from $x$, consider each neighbor $v$. Add the cost of reaching that neighbor to the neighbor's reported cost of reaching the destination, then choose the minimum.

For example, router J has neighbors A, I, H, and K. Its candidate costs to C are:

| Via neighbor | Cost from J to neighbor | Neighbor's reported cost to C | Total |
|---|---:|---:|---:|
| A | 8 | 25 | 33 |
| I | 10 | 18 | 28 |
| H | 12 | 19 | 31 |
| K | 6 | 36 | 42 |

J therefore records:

```text
Destination C: cost 28, next hop I
```

The metric might represent delay, hop count, or another measure, depending on the protocol.

A difficulty with distance-vector routing is its reliance on neighbors' reports. Stale information can produce loops and convergence problems such as counting to infinity.

### Link state: computing shortest paths from topology

The basic procedure is:

1. Discover directly connected neighbors.
2. Determine the cost of each link.
3. Generate link-state information.
4. Flood that information within the relevant scope.
5. Have each router compute shortest paths from the topology, for example using Dijkstra's algorithm.

Fields such as `Seq.` and `Age` help distinguish newer information and remove expired information.

The two approaches differ as follows:

| Distance vector | Link state |
|---|---|
| Neighbors report their distances to destinations | Routers announce their direct connections and link costs |
| Update routes from neighbors' distances | Compute routes from the topology |
| Common mathematical basis: Bellman-Ford | Common shortest-path algorithm: Dijkstra |

### Tunneling: adding an outer encapsulation

For example, two IPv6 networks can connect through an IPv4 network.

The packet changes as follows:

```text
Before the tunnel:             IPv6 packet

Across the IPv4 network: IPv4 header + IPv6 packet

After the tunnel:              IPv6 packet
```

Intermediate routers forward using the outer IPv4 header. The tunnel exit removes that encapsulation.

A tunnel is an encapsulation and forwarding mechanism. Whether it encrypts traffic depends on the protocol used.

### IPv4 header: information needed for forwarding

An IPv4 header is at least 20 bytes. Options can extend it to as much as 60 bytes.

| Field | Purpose |
|---|---|
| Version | IP version; 4 for IPv4 |
| IHL | Header length in four-byte units; 5 means 20 bytes |
| Total Length | Length of the entire IPv4 packet, including header and data |
| Source / Destination Address | Source and destination IPv4 addresses, 32 bits each |
| TTL | Limits continued forwarding to prevent indefinite circulation |
| Protocol | Identifies the upper-layer protocol, such as 6 for TCP or 17 for UDP |
| Header Checksum | Detects corruption in the IPv4 header |
| Identification, Flags, Fragment Offset | Support fragmentation and reassembly |
| Differentiated Services | Supports functions such as differentiated service and congestion notification |

Two distinctions matter:

- Protocol is not a port number: it selects TCP, UDP, or another upper-layer protocol. A transport port then identifies an application endpoint.
- The IPv4 header checksum does not cover the payload.

Among the fragmentation fields, DF means “do not fragment,” MF means “more fragments,” and the fragment offset uses eight-byte units.

### IP addresses: from address classes to CIDR

IPv4 originally used these address classes:

- Class A: default network prefix `/8`.
- Class B: default network prefix `/16`.
- Class C: default network prefix `/24`.
- Class D: multicast.
- Class E: reserved uses.

Modern IPv4 allocation and routing use classless prefixes. Do not infer the subnet mask solely from the beginning of an address; read the explicit `/n`. Historical class ranges also include special addresses. For example, `127.0.0.0/8` is used for loopback, not ordinary public host addressing. [CIDR specification](https://www.rfc-editor.org/rfc/rfc4632.html)

For example:

```text
192.168.8.34/24
```

has a 24-bit network prefix and an eight-bit host portion.

### Subnets and route aggregation

Consider a `/24`:

```text
Host address:      192.168.8.34/24
Subnet mask:       255.255.255.0
Network address:   192.168.8.0
Broadcast address: 192.168.8.255
```

An ordinary IPv4 broadcast subnet with this prefix contains 256 addresses, typically with 254 available for hosts.

The network address is calculated by bitwise AND:

$$
\text{Network address}=\text{IP address}\ \&\ \text{Subnet mask}
$$

Route aggregation can combine these eight contiguous, aligned `/24` prefixes:

```text
192.168.8.0/24
192.168.9.0/24
…
192.168.15.0/24
```

into a single prefix:

```text
192.168.8.0/21
```

Distinguishing eight networks requires three bits, so the prefix shortens from 24 bits to:

$$
24-\log_2 8=21
$$

The third octet ranges from 8 through 15:

```text
8  = 00001000
15 = 00001111
     └───┘
     First 5 bits match
```

Add those five shared bits to the first two octets' 16 bits, and the common prefix is 21 bits.

This aggregate covers `192.168.8.0` through `192.168.15.255`. Aggregating routes does not automatically merge the original LANs into a single LAN.

### SNAT and DNAT

When a private-network device accesses an external network, source address translation can change:

```text
Source before translation: 10.0.0.1:5544
Source after translation:  198.60.42.12:3344
```

This is source address translation. The port changes too, so the example also illustrates port translation.

- SNAT changes the source address, commonly for private hosts accessing an external network.
- DNAT changes the destination address, commonly to map a public entry point to an internal server.

A DNAT example is:

```text
External destination: 203.0.113.5:8080
Internal destination: 10.0.0.10:80
```

The translating device maintains mapping state and applies the corresponding reverse translation to returning traffic. Address-and-port translation lets multiple private connections share one public address.

### ARP, RARP, and DHCP

ARP resolves an IPv4 address to a link-layer address on the local link, commonly a MAC address.

For example, a computer sending a frame to `192.168.1.20` on its LAN can broadcast a request asking which device uses that IP address.

For an external destination, it usually needs the next-hop default gateway's MAC address. The frame goes to the gateway, while the IP packet retains the remote server as its destination.

RARP is a historical protocol that let a device obtain its IP address from its hardware address, for example during the startup of a diskless workstation.

DHCP supplies configuration such as an IP address, subnet mask, default gateway, and DNS server. Its classic initial exchange is called DORA:

```text
Discover → Offer → Request → ACK
Find a server → offer settings → request selected settings → confirm assignment
```

Addresses normally have a lease that must be renewed. DHCP does not require a user to log into a server first. [DHCP exchange](https://www.rfc-editor.org/rfc/rfc2131.html)

### OSPF and BGP

An autonomous system, or AS, is a collection of networks operating under a unified routing policy, such as a provider's network.

| Protocol | Main role | Main approach |
|---|---|---|
| OSPF | Routing within an autonomous system | Link state, shortest-path computation, areas |
| BGP | Exchanging routes between autonomous systems | Path attributes and routing policy |

OSPF can divide a large routing network into areas, with a backbone area organizing communication between areas.

BGP carries attributes such as the AS path. Its choices are influenced by administrative policy and business relationships; it does not simply select the geographically shortest or lowest-latency path.

## 5. Transport layer: endpoints, reliability, and sending control

### Ports and communication endpoints

One host can run a browser, SSH client, and mail application simultaneously. An IP address provides network-layer addressing; transport ports further distinguish communication endpoints.

A TCP connection is commonly distinguished by a four-tuple:

```text
Source IP, source port, destination IP, destination port
```

For example:

```text
192.168.1.10:51000 → 203.0.113.20:443
192.168.1.10:51001 → 203.0.113.20:443
```

can be different connections. A server's port 443 can therefore serve many connections at the same time.

### UDP: transmission with message boundaries

A UDP header is always eight bytes, consisting of four 16-bit fields:

| Field | Purpose |
|---|---|
| Source Port | Source port |
| Destination Port | Destination port |
| Length | Total length of UDP header and data |
| Checksum | Error detection |

UDP preserves message boundaries. It does not itself retransmit losses, guarantee ordered delivery, or provide TCP-style connection management and flow control.

Applications using UDP must address loss, ordering, and sending rate as needed. DNS, real-time audio and video, and other transport protocols built on UDP are examples.

Low protocol overhead does not mean that every application will be faster with UDP.

### Common service ports

| Port | Service |
|---|---|
| 21 | FTP control connection |
| 20 | Common server data port for active-mode FTP |
| 22 | SSH |
| 25 | SMTP |
| 80 | HTTP |
| 110 | POP3 |
| 143 | IMAP |
| 443 | HTTPS |
| 554 | RTSP |
| 631 | IPP printing protocol |

The standard RTSP port is 554. [IANA port registry](https://www.iana.org/assignments/service-names-port-numbers?search=554)

These are conventional defaults. Services can be configured on different ports.

### TCP header and byte sequence numbers

A TCP header is at least 20 bytes. Important fields include:

- Sequence Number: the starting byte sequence number of this segment's data.
- Acknowledgment Number: the sequence number the receiver expects next.
- Window: the receive window advertised by the receiver.
- Checksum: checks the TCP header and data, together with pseudo-header information.
- Flags: including SYN, ACK, FIN, and RST.
- Options: such as maximum segment size, window scaling, and timestamps.

TCP sequence numbers count bytes. Suppose a segment carries:

```text
SEQ = 1000
Data length = 500 bytes
```

Its data occupies sequence numbers 1000 through 1499. Once received as part of a contiguous sequence, the receiver can acknowledge:

```text
ACK = 1500
```

This means that the data before 1500 has arrived contiguously and 1500 is expected next.

TCP provides a byte stream without application-message boundaries. Two calls to `send()` do not necessarily correspond to two calls to `recv()`. Applications use mechanisms such as lengths or delimiters to identify their own messages.

### TCP's three-way handshake

![TCP handshake with client initial sequence number 100 and server initial sequence number 500; both sides acknowledge the other's number.](/blog/from-url-to-webpage/handshake-basics-en.svg)

The three-way handshake. [Full-size figure](/blog/from-url-to-webpage/handshake-basics-en.svg) · [Mermaid source](/blog/from-url-to-webpage/handshake-basics-en.mmd)

The steps are:

1. The client requests a connection and announces its initial sequence number.
2. The server acknowledges the client's number and announces its own.
3. The client acknowledges the server's number.

The third step tells the server that the client received and acknowledged its connection information. The exchange also helps prevent an old connection request from directly creating an incorrect connection.

SYN consumes one sequence number, which is why the acknowledgments add one.

### TCP closing and half-close

```text
Client → server: FIN, I have no more data to send
Server → client: ACK, your sending direction is acknowledged as finished

The server can still send its remaining data…

Server → client: FIN, I also have no more data to send
Client → server: ACK, your sending direction is acknowledged as finished
```

After sending FIN, the client can still receive data in the opposite direction. This is a half-close.

Four messages illustrate the usual sequence, but ACK and FIN can sometimes be combined. Like SYN, FIN consumes a sequence number.

### TCP state machine

Start with the most common paths:

```text
Active open:
CLOSED → SYN-SENT → ESTABLISHED

Passive open:
LISTEN → SYN-RECEIVED → ESTABLISHED

Typical active close:
ESTABLISHED → FIN-WAIT-1 → FIN-WAIT-2 → TIME-WAIT → CLOSED

Typical passive close:
ESTABLISHED → CLOSE-WAIT → LAST-ACK → CLOSED
```

Two states deserve particular attention:

- CLOSE-WAIT means the peer's FIN has arrived and the local application has yet to close its sending direction. Many connections lingering here can indicate that an application is not closing them promptly.
- TIME-WAIT retains state after the final acknowledgment in a normal active close. This allows another acknowledgment if the peer retransmits FIN and reduces interference from old segments with later connections.

The classic duration is 2MSL. MSL is the maximum segment lifetime, not round-trip time. [TCP closing and TIME-WAIT](https://www.rfc-editor.org/rfc/rfc9293.html#section-3.6)

### Flow control and congestion control

First distinguish two windows:

| Window | Problem addressed | Who determines it |
|---|---|---|
| Receive window `rwnd` | How much data the receiver can accept | Advertised by the receiver |
| Congestion window `cwnd` | How much unacknowledged data the network should carry | Adjusted by the sender from feedback |

Outstanding data is mainly limited by:

$$
\min(rwnd,cwnd)
$$

The amount of new data that can be sent also depends on how much is already outstanding. TCP's Window header field advertises the receive window; the congestion window is internal sender state.

Classic TCP congestion control includes:

| Phase | Approximate window behavior |
|---|---|
| Slow start | Starts small and roughly doubles per RTT under ideal conditions |
| Congestion avoidance | Switches to roughly linear growth after reaching a threshold |
| Retransmission timeout | Reduces the window substantially and restarts slow start |
| Fast retransmit and fast recovery | Use duplicate acknowledgments to detect likely loss earlier and reduce sending intensity |

A teaching example is:

```text
Slow start:           1 → 2 → 4 → 8
Congestion avoidance: 8 → 9 → 10 → 11
```

Starting at one is an illustration, not a claim about every implementation's initial window.

Classic fast retransmit uses three duplicate ACKs as a loss signal, allowing retransmission before a timeout. Fast recovery avoids restarting from an extremely small window for every such event. Reno also includes temporary window adjustments during recovery. [Classic TCP congestion control](https://www.rfc-editor.org/rfc/rfc5681.html)

## 6. Application layer: DNS and HTTP

### DNS namespace

Consider this domain name:

```text
robot.cs.washington.edu.
```

Read it from right to left:

```text
.               Root
edu             Top-level domain
washington      Next domain level
cs              Another domain level
robot           Specific name
```

The trailing dot represents the DNS root and is usually omitted in everyday input.

The hierarchy lets organizations manage their own portions without a single server maintaining every Internet name.

A domain name is also different from a complete URL:

```text
https://www.example.com/course?id=19
        └── domain ───┘└─ path and query ─┘
```

DNS resolves names; it does not interpret the application meaning of `/course?id=19`.

### DNS resource records

| Type | Purpose |
|---|---|
| A | IPv4 address for a name |
| AAAA | IPv6 address for a name |
| CNAME | Alias pointing to another name |
| MX | Mail receiving server and preference |
| NS | Authoritative name server for a zone |
| SOA | Zone administration data, including serial number and refresh parameters |
| PTR | Name pointer used in reverse lookups |
| TXT | Text, often used for verification or mail policy |
| SRV | Service location, including target, port, and priority |

CNAME points to another name; it is not another kind of IP address record.

SPF policy is published in TXT records, and use of the separate SPF RR type has been discontinued. [SPF specification](https://www.rfc-editor.org/rfc/rfc7208.html#section-3.1)

### DNS queries and caching

With no cached answer, resolving `robot.cs.washington.edu` can proceed as follows:

1. The computer asks its configured recursive resolver.
2. The resolver asks a root server and receives information about `.edu` servers.
3. It asks a `.edu` server and learns about servers for `washington.edu`.
4. It follows any further delegation, such as to a server responsible for `cs.washington.edu`.
5. It obtains the answer, returns it to the client, and caches it as allowed.

In this exchange:

- The client asks the recursive resolver to obtain a result on its behalf.
- The resolver's successive queries to other servers are typically iterative queries.

Root servers normally provide referrals; they do not directly store every host's IP address.

Caching means later queries need not always begin at the root. A DNS record's TTL is a cache lifetime, distinct from the IP header's forwarding-limit TTL.

### How the layers cooperate when a link is clicked

An HTTPS visit over TCP follows these steps; the product-page example at the end expands them:

1. Parse the URL into scheme, hostname, port, and path.
2. Check caches and resolve the hostname through DNS.
3. Choose a route and next hop, such as the default gateway.
4. Prepare link-layer delivery, using ARP for a next-hop MAC if needed.
5. Establish TCP with its three-way handshake.
6. Establish TLS protection, including authentication and key agreement.
7. Send an HTTP request, such as for `/index.html`.
8. Receive the HTTP response containing HTML or other content.
9. Request dependencies and render the page, processing CSS, JavaScript, and images.

These steps need not all repeat on every click: DNS answers, connections, and resources may be reusable. The actual order also has dependencies. For example, sending an external DNS query can already require ARP to resolve the gateway's MAC.

HTTPS does not always use TCP. HTTP/3 uses QUIC, which runs over UDP and provides reliable stream transport and other capabilities. [HTTP/3 specification](https://www.rfc-editor.org/rfc/rfc9114.html)

### HTTP connection reuse

HTTP/1.x has three common ways to use connections:

| Method | Sequence | Main effect |
|---|---|---|
| New connection each time | Connect → request → response, then connect again | Repeats connection establishment costs |
| Persistent connection, sequential requests | Keep the connection and send the next request after the previous response | Saves setup costs but retains serial waiting |
| Persistent connection, pipelined requests | Send further requests without waiting for earlier responses | Reduces request waiting, but response ordering remains constrained |

HTTP/1.1 pipelining is different from HTTP/2 multiplexing.

HTTP/2 introduces streams and frames so requests and responses can be interleaved over one connection. With TCP, lost bytes can still hold up multiple streams. HTTP/3 builds its stream mechanism on QUIC, reducing this form of cross-stream transport head-of-line blocking. [HTTP transport differences](https://www.rfc-editor.org/rfc/rfc9114.html#section-1)

### HTTP methods and status codes

HTTP methods express the operation a client wants to perform on a resource:

| Method | Meaning |
|---|---|
| GET | Retrieve a representation of a resource |
| HEAD | Request metadata similar to GET without response content |
| POST | Submit data for processing according to the target resource's semantics |
| PUT | Create or replace the target resource state with the supplied representation |
| DELETE | Request removal of the association between the resource and its current functionality |
| OPTIONS | Query communication options |
| CONNECT | Establish a tunnel, commonly through a proxy |
| TRACE | Request a diagnostic loopback |

These methods also apply to JSON APIs and many other resources. [HTTP method semantics](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.3)

Idempotence means that making the same request multiple times has the same intended effect as making it once, such as repeatedly PUTting the same resource representation. It does not require identical status codes on every attempt.

Status codes fall into five groups:

| Range | Meaning | Examples |
|---|---|---|
| 1xx | Interim information | 100 Continue |
| 2xx | Success | 200 OK, 201 Created, 204 No Content |
| 3xx | Redirection or conditional-request outcomes | 301, 302, 304 |
| 4xx | Client-related request problems | 400, 401, 403, 404 |
| 5xx | Server-side processing failures | 500, 502, 503, 504 |

Some useful distinctions:

- 401: valid authentication credentials are missing.
- 403: the server understands the request but refuses to fulfill it.
- 404: the requested resource was not found.
- 304: a conditional request found no modification, so the stored representation can be reused; this is not an ordinary redirect.
- 204: the request succeeded without response content.

### HTTP headers and cache validation

Grouping headers by purpose is more useful than memorizing them independently:

| Purpose | Typical fields |
|---|---|
| Target and client information | `Host`, `User-Agent`, `Referer` |
| Content negotiation | `Accept`, `Accept-Encoding`, `Accept-Language` |
| Authentication and state | `Authorization`, `Cookie`, `Set-Cookie` |
| Content description | `Content-Type`, `Content-Length`, `Content-Encoding` |
| Caching and conditional requests | `Cache-Control`, `ETag`, `If-None-Match`, `Last-Modified`, `If-Modified-Since` |
| Redirection and range requests | `Location`, `Range`, `Content-Range`, `Accept-Ranges` |

Read several fields as pairs:

- Accept states which types the client can receive; Content-Type identifies the type of the supplied content.
- Accept-Encoding states supported content encodings; Content-Encoding identifies the encoding actually applied, such as gzip.
- Set-Cookie asks the client to store a cookie; Cookie carries stored cookies on later requests according to the applicable rules.
- ETag identifies a version of a representation; If-None-Match supplies a previously obtained tag for a conditional request.

Whether a header applies to requests, responses, or both depends on the field. For example, a POST request can also carry Content-Type and Content-Length.

An HTTP/1.1 request can look like:

```http
GET /index.html HTTP/1.1
Host: example.com
Accept: text/html
Accept-Encoding: gzip
If-None-Match: "v3"

```

The blank line ends the header section.

If the server confirms that the selected representation still matches `"v3"`, it can return:

```http
HTTP/1.1 304 Not Modified
ETag: "v3"
Cache-Control: max-age=60

```

The browser then reuses its cached content. A 304 still involves a network request; it avoids transferring the full representation again. If the cached response is still fresh, the browser may reuse it without even making that validation request.

## Supporting example: connecting the layers through a product-page visit

This example revisits the layering, addressing, and protocol responsibilities above. Assume the computer connects to a home router through Ethernet, uses IPv4, and has no usable DNS cache, page cache, or existing connection. DNS uses ordinary UDP; the website uses HTTP/2, TLS 1.3, and TCP. The domain, public addresses, and port mappings are illustrative.

The requested page displays a blue mechanical keyboard's name, price, image, and reviews:

```text
https://shop.example.com/products/42?color=blue#reviews
```

| Role | Address |
|---|---|
| Computer | `192.168.1.10/24` |
| Default gateway, the router's LAN interface | `192.168.1.1` |
| Router's WAN interface | `198.51.100.23` |
| Recursive DNS resolver | `192.0.2.53` |
| Web server, discovered through DNS later | `203.0.113.80` |

### Network configuration and URL parsing

DHCP first answers four configuration questions:

```text
What is my own IP address?
Which addresses are in my subnet?
Where should I send traffic for external destinations?
Which server should I ask for DNS answers?
```

Here the home router provides DHCP service. The client uses UDP port 68 and the server uses UDP port 67:

```text
Computer                         DHCP server
   |--- DHCP Discover -------------->|
   |<-- DHCP Offer ------------------|
   |--- DHCP Request --------------->|
   |<-- DHCP ACK --------------------|
```

The resulting settings follow. DHCP runs when obtaining or renewing configuration, not for every page visit.

```text
IP address:      192.168.1.10
Subnet mask:     255.255.255.0
Default gateway: 192.168.1.1
DNS server:      192.0.2.53
```

The browser then parses the URL:

| Component | Value | Purpose |
|---|---|---|
| Scheme | `https` | Use HTTPS |
| Host | `shop.example.com` | Hostname |
| Port | Default `443` | Service port |
| Path | `/products/42` | Resource path |
| Query | `color=blue` | Query parameter |
| Fragment | `reviews` | Location within the page |

```text
Use HTTPS,
connect to port 443 on shop.example.com,
and request /products/42?color=blue.
```

The `#reviews` fragment is not sent to the server as part of the URL. The browser handles it once the page content is available.

### Routing and ARP before the DNS query can leave

The name-resolution question is:

```text
What is the IPv4 address of shop.example.com?
```

This query uses these endpoints:

```text
Source:      192.168.1.10:53000
Destination: 192.0.2.53:53
Transport:   UDP
```

The local subnet and selected route are:

```text
192.168.1.0/24
```

```text
Default route → next hop 192.168.1.1
```

Because the DNS server is external, the packet first goes to the gateway. If its MAC is absent from the ARP cache, the computer broadcasts:

```text
Who has IP address 192.168.1.1?
Tell 192.168.1.10 your MAC address.
```

The router replies, and the computer records the mapping:

```text
I have 192.168.1.1.
My MAC address is 02:00:00:00:00:01.
```

```text
192.168.1.1 → 02:00:00:00:00:01
```

The destination addresses at the two layers therefore differ:

```text
IP destination:    the DNS server's IP
Frame destination: the gateway's MAC
```

ARP does not use TCP or UDP and has no transport ports. The computer needs the next hop's MAC, not the remote DNS server's MAC. In this example, ARP therefore happens before the DNS query is transmitted.

### Encapsulating the DNS query and resolving the name

The query gains headers at successive layers before being encoded as signals:

```text
Application layer
DNS query: what is the A record for shop.example.com?

       ↓ Add a UDP header

Transport layer
UDP: source port 53000, destination port 53

       ↓ Add an IPv4 header

Network layer
IPv4: source 192.168.1.10, destination 192.0.2.53

       ↓ Add an Ethernet header and trailer

Data link layer
Ethernet: computer's source MAC, gateway's destination MAC

       ↓ Encode and modulate signals

Physical layer
Send electrical signals through the cable
```

The router extracts and forwards the IP packet and creates a NAT mapping for this UDP exchange. If the resolver also lacks a cached answer, it follows the name hierarchy:

```text
Computer
  |
  | What is the address of shop.example.com?
  v
Recursive resolver
  |
  +-- Ask a root server
  |    → Obtain a referral to .com name servers
  |
  +-- Ask a .com name server
  |    → Obtain a referral to example.com's authoritative servers
  |
  +-- Ask an authoritative server for example.com
       → shop.example.com's A record is 203.0.113.80
```

The resolved address and web service endpoint are:

```text
shop.example.com → 203.0.113.80
```

```text
Target service: 203.0.113.80:443
```

The resolver's root, top-level-domain, and authoritative queries are new queries using its own network endpoints. Results can be cached according to their DNS TTL.

### TCP through NAT and hop-by-hop forwarding

The computer selects temporary TCP port 51514:

```text
192.168.1.10:51514 → 203.0.113.80:443
```

The router maps it to a public endpoint, which becomes the source seen by the server:

```text
Internal TCP endpoint              Public endpoint
192.168.1.10:51514        ↔    198.51.100.23:62001
```

```text
198.51.100.23:62001
```

Packets travel through:

```text
Computer → home router → provider network → other networks → server's network → server
```

Ordinary routers consult their forwarding tables, decrement IPv4 TTL, and encapsulate for the outgoing link. OSPF and BGP help maintain routing information. An ordinary Layer 2 switch generally forwards a frame without rewriting its source and destination MAC addresses.

![The product-page TCP handshake, with client initial sequence number 1000 and server initial sequence number 8000.](/blog/from-url-to-webpage/handshake-example-en.svg)

The example's handshake; every arrow travels through the lower network layers. [Full-size figure](/blog/from-url-to-webpage/handshake-example-en.svg) · [Mermaid source](/blog/from-url-to-webpage/handshake-example-en.mmd)

The result is a reliable, ordered byte-stream connection. Server authentication and encryption follow through TLS.

### TLS handshake: authenticating and deriving keys

These are the main messages in a full TLS 1.3 certificate handshake:

```text
Browser                                      Server
  |--- ClientHello ---------------------------->|
  |    Supported versions, algorithms, key share |
  |                                             |
  |<-- ServerHello -----------------------------|
  |<-- Encrypted extensions, certificate,        |
  |    signature proof, Finished                |
  |                                             |
  | Validate certificate and handshake messages |
  |--- Finished ------------------------------->|
  |                                             |
  |<--------- Encrypted application data ------>|
```

The browser checks the certificate's hostname, trust chain, validity period, and the server's signature proof. Both sides derive communication keys from the ephemeral key exchange. Subsequent data receives symmetric encryption and integrity protection; the certificate's public key is not used to directly encrypt the whole page.

SNI identifies the requested server name. ALPN selects the application protocol, here `h2` for HTTP/2. [TLS 1.3 handshake](https://www.rfc-editor.org/rfc/rfc8446.html#section-2)

### HTTP request, server processing, and response

After HTTP/2 initialization, the request fields have this readable form. On the wire, HTTP/2 uses binary frames:

```text
:method: GET
:scheme: https
:authority: shop.example.com
:path: /products/42?color=blue
accept: text/html
accept-encoding: gzip, br
```

At the application level, this means:

```text
Return the blue version of product 42's page.
I want HTML and support the indicated content compression.
```

The downward processing and the conceptual structure of an Ethernet frame are:

```text
HTTP/2: encode the request into HEADERS and other frames
   ↓
TLS: encrypt and add integrity protection
   ↓
TCP: organize the byte stream into segments
   ↓
IP: add source and destination IP and other network fields
   ↓
Ethernet: encapsulate a frame for the gateway
   ↓
Physical: transmit as signals
```

```text
[Ethernet header][IPv4 header][TCP header][part of the TLS byte stream][FCS]
```

HTTP/2 frames, TLS records, TCP segments, and Ethernet frames do not need aligned boundaries. [HTTP/2 frames and streams](https://www.rfc-editor.org/rfc/rfc9113.html#section-2) The server processes the layers in reverse before handing the request to its application:

```text
Physical layer recovers bits from signals
   ↓
NIC and link layer recognize frames and check FCS
   ↓
IP layer processes packets addressed to this host
   ↓
TCP identifies the connection, orders and deduplicates data, and delivers contiguous bytes
   ↓
TLS verifies and decrypts
   ↓
HTTP/2 parses the request
   ↓
Web application handles /products/42?color=blue
```

```text
Find product 42
→ Select the blue variant
→ Read its name, price, and image address
→ Generate HTML
```

Suppose the application generates this HTML:

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
  <p class="price">¥299</p>
  <img src="/images/keyboard-blue.webp"
       width="600" height="400" alt="Blue mechanical keyboard">
  <section id="reviews">Customer reviews</section>
</body>
</html>
```

The response fields might be:

```text
:status: 200
content-type: text/html; charset=utf-8
content-encoding: br
```

The content is compressed as declared, then returned through TLS and TCP/IP. The example combines the HTTPS entry point and application into one server for clarity; a deployed site can also involve a CDN or reverse proxy.

### Return traffic, loss, and resource reuse

The response's public endpoints and its endpoints after reverse NAT are:

```text
203.0.113.80:443 → 198.51.100.23:62001
```

```text
203.0.113.80:443 → 192.168.1.10:51514
```

If the second segment is lost:

```text
Sent:     segment 1, segment 2, segment 3, segment 4
Received: segment 1,            segment 3, segment 4
```

TCP can buffer later data and resume contiguous delivery once retransmission fills the gap. Two constraints limit sending:

```text
Does the receiver have room? → flow control and receive window
Can the network handle it?   → congestion control and congestion window
```

TCP acknowledging data does not mean that the browser has displayed it. The browser still decrypts, decompresses, and parses the content, discovering these dependencies:

```html
<link rel="stylesheet" href="/assets/site.css">
<script defer src="/assets/product.js"></script>
<img src="/images/keyboard-blue.webp">
```

It then makes resource requests that can share the existing HTTP/2 connection:

```text
GET /assets/site.css
GET /assets/product.js
GET /images/keyboard-blue.webp
```

```text
Within one TCP/TLS connection:

CSS data → image data → JS data → image data → CSS data…
```

Frames from different streams can be interleaved, but a gap in the TCP byte stream can still hold up multiple streams.

### Browser rendering and subsequent requests

HTML produces a DOM, and CSS contributes style information before layout and painting:

![HTML, CSS, and JavaScript feed browser processing, followed by layout, painting, rasterization, and compositing.](/blog/from-url-to-webpage/rendering-en.svg)

The main rendering dependencies. [Full-size figure](/blog/from-url-to-webpage/rendering-en.svg) · [Mermaid source](/blog/from-url-to-webpage/rendering-en.mmd)

The DOM represents document structure. Layout computes positions and sizes, painting produces drawing instructions, and rasterization and compositing produce and combine pixels. Downloading and rendering can overlap; the page need not wait for every resource before displaying content. [Browser parsing and rendering](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work#render)

The example's deferred script downloads without blocking HTML parsing. Image dimensions reserve space in advance. Once the reviews element exists, the browser can handle the `#reviews` fragment.

After displaying the page, the script may request stock information:

```javascript
fetch("/api/stock?product=42")
  .then(response => response.json())
  .then(data => {
    // Update the page using the stock result
  });
```

That request passes through the layers again and can trigger a page update:

```text
HTTP request
→ TLS
→ TCP
→ IP
→ Data link layer
→ Physical layer
→ Server
→ Response returns
→ JavaScript updates the DOM
→ Necessary style, layout, and paint updates
```

First visible content, DOMContentLoaded, load, and business-data readiness are different milestones. Displaying a page does not require immediate TCP closure; the connection can remain reusable.

### Complete sequence: tracking IP, MAC, and ports together

This diagram places the steps on one timeline. MAC addresses use interface labels, and the Internet lifeline combines multiple router hops. TLS and HTTP arrows show logical end-to-end exchanges that still traverse the same gateways and route.

| MAC label | Interface |
|---|---|
| `C` | Computer's network interface |
| `GL` / `GW` | Home router's LAN / WAN interfaces |
| `I` | Provider's first-hop router interface |
| `RD` / `RS` | Last-hop router interface on the DNS / web server's link |
| `D` / `S` | DNS / web server network interface |

![Complete sequence showing ARP, DNS, TCP, TLS, HTTP, and rendering, with IP, MAC, and port changes along the path.](/blog/from-url-to-webpage/full-sequence-en.svg)

The complete sequence; open the full-size figure to read the address details. [Full-size figure](/blog/from-url-to-webpage/full-sequence-en.svg) · [Mermaid source](/blog/from-url-to-webpage/full-sequence-en.mmd)

| Field | Computer sends | After outbound NAT | Ordinary routing | Return to the home network |
|---|---|---|---|---|
| IP | Private computer address is the source | Source becomes the router's public IP | Addresses usually stay the same; TTL decreases | Destination becomes the private computer IP |
| TCP port | Source port 51514 | Source changes to 62001 | Unchanged | Destination changes back to 51514 |
| MAC | C → GL | GW → I | Re-encapsulated at each router hop | Final hop GL → C |

The diagram's UDP query uses the NAT mapping `53000 ↔ 63000`, separate from TCP's `51514 ↔ 62001`. NAT translates addresses and ports, TLS encrypts the communication, and TCP provides a reliable byte stream. Each addresses a different responsibility.

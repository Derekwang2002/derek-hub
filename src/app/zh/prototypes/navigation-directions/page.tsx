import { redirect } from "next/navigation";

// The selected direction now lives on the homepage. Keep old preview links working.
export default function Page() { redirect("/zh"); }

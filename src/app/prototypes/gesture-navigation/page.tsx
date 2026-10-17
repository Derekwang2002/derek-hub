import type { Metadata } from "next";
import { getSections } from "./data";
import { GestureStudies } from "./gesture-studies";
export const metadata: Metadata={title:"Gesture navigation studies",robots:{index:false,follow:false}};
export default async function Page(){return <GestureStudies locale="en" sections={await getSections("en")}/>;}

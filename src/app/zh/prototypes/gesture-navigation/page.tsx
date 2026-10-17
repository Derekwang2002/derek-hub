import type { Metadata } from "next";
import { getSections } from "../../../prototypes/gesture-navigation/data";
import { GestureStudies } from "../../../prototypes/gesture-navigation/gesture-studies";
export const metadata: Metadata={title:"滚动与手势导航原型",robots:{index:false,follow:false}};
export default async function Page(){return <GestureStudies locale="zh" sections={await getSections("zh")}/>;}

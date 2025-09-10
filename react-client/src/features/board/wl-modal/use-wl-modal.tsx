import { createGStore } from "create-gstore";
import React, { useState } from "react";

// type UseWLImageModalReturn = {
//   isOpenWL: boolean;
//   imageUrl: string;
//   open: (url: string) => void;
//   close: () => void;
//   WLData: ()=>object;
// };

type WLDataType = {
  author: {
    fullName: string, 
    email: string}
  content: string
  createdAt: Date
  object: string
  photoUrl: string
  } 




export const useWLModal = createGStore(
  () => {
  const [isOpenWL, setIsOpenWL] = useState(false);
  // const [imageUrl,setImageUrl] = useState<string>("")
  const [WLData,setWLData] = React.useState<WLDataType | null>(null)
  //   const open = (url:string) => {
  //     console.log(url)
  //   return (
  //     setIsOpenWL(true),
  //     setImageUrl(url)
  //   )
  // };


  const open = (data:WLDataType) => {
    console.log(data)
    return (
      setIsOpenWL(true),
      setWLData(data)
    )
  };

  const close = () => {
    return (
      setIsOpenWL(false)
    )
  };

  return {
    isOpenWL,
    open,
    close,
    WLData
  }
}
) 


 
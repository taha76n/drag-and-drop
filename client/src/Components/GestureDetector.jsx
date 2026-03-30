import React, { useEffect, useRef, useState } from 'react'

const GestureDetector = ({onGesture}) => {

  const videoRef = useRef();
  const [isVideoStarted, setIsVideoStarted] = useState(false);
  const [classifier, setClassifier] = useState(null)

  useEffect(()=>{
   const loadModel = async () => {
    try {
      const loadClassifier = await window.ml5.imageClassifier(import.meta.env.VITE_MODEL, ()=>{
        console.log("gesture model loaded");
      })
      setClassifier(loadClassifier)
    } catch (error) {
      console.log("Model loading failed: ", error);
      
    }
   }
   loadModel()
  }, [])

  const classifyGesture = () => {
    if (classifier && videoRef.current) {
      classifier.classify(videoRef.current, (results, error) => {
        if(error) {
          console.error("Classification error: ", error);
          return;
        }
        // console.log(results)
        if(results && results[0]) {
          onGesture(results[0].label, results[0].confidence);
        }

        setTimeout(() => classifyGesture(), 30)
      })
    } else {
      setTimeout(() => classifyGesture(), 30)
    }
  }

  const startVideo = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({video : true}).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () =>{
          videoRef.current.play();
          setIsVideoStarted(true);
          classifyGesture();
        }
      }
    }).catch((error)=>{
      console.log("Error while trying to access the camera ", error);
    })
  }
}

  useEffect(()=>{
    if (classifier && !isVideoStarted) {
      startVideo();
    }
  }, [classifier])
  return (
    <>
     <video height={640} width={480} ref={videoRef} autoPlay muted style={{display:'none'}}>
      </video> 
    </>
  )
}

export default GestureDetector
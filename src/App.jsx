import React, { useState, useEffect, useRef } from 'react'
import logo from './logo.svg'
import './App.css'

const initialSpeed = (2 * Math.PI) / 2000

function App() {
  const [rotation, setRotation] = useState(0)
  const [touches, touchTime, events] = useTouchesAndTime()
  const prevTouchesRef = useRef([])
  const prevTouchTimeRef = useRef(0)
  const [speed, setSpeed] = useState(initialSpeed)
  useEffect(() => {
    if (touches.length > 0 && prevTouchesRef.current.length > 0) {
      const timeDiff = touchTime - prevTouchTimeRef.current
      const dist = distance(touches[0], prevTouchesRef.current[0])
      const distLength = Math.sqrt(dist[0] ** 2 + dist[1] ** 2)
      const distDirection =
        (dist[0] === 0 ? 0 : dist[0] / Math.abs(dist[0])) *
        (dist[1] > window.innerHeight / 2 ? 1 : -1)
      const deltaV = distDirection * (distLength / timeDiff / 100)
      if (deltaV !== deltaV) {
        debugger
      }
      if (timeDiff && dist) setSpeed(prevSpeed => prevSpeed + deltaV)
    }
    prevTouchesRef.current = touches
    prevTouchTimeRef.current = touchTime
  }, [touches])
  useInterval(() => {
    setSpeed(prevSpeed =>
      Math.abs(prevSpeed) < initialSpeed ? prevSpeed : prevSpeed * 0.99
    )
    setRotation(prevRotation => prevRotation + speed)
  }, 1000)
  console.log(speed)
  return (
    <div className="App" {...events}>
      <header className="App-header">
        <img
          src={logo}
          className="App-logo"
          style={{
            transform: `rotate(${rotation}rad)`
          }}
          alt="logo"
        />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer">
          Learn React
        </a>
      </header>
    </div>
  )
}

function useInterval(callback, intervalDuration) {
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])
  useEffect(() => {
    const interval = setInterval(() => callbackRef.current())
    return () => clearInterval(interval)
  }, intervalDuration)
}

function useTouchesAndTime() {
  const [touches, setTouches] = useState([])
  const [touchTime, setTouchTime] = useState(0)
  const [mouseDown, setMouseDown] = useState(false)

  const touchSupported = 'ontouchstart' in document.body
  function setTouchesAndTime(touches) {
    setTouches(touches)
    setTouchTime(new Date().getTime())
  }
  function handleTouch(e) {
    e.persist()
    e.preventDefault()
    setTouchesAndTime(Object.values(e.touches))
  }
  function handleClick(e) {
    e.persist()
    e.preventDefault()
    if (e.type === 'mousedown') setMouseDown(true)
    else if (e.type === 'mouseup') {
      setMouseDown(false)
      setTouchesAndTime([])
    } else if (mouseDown) {
      const { pageX, pageY } = e
      setTouchesAndTime([{ pageX, pageY }])
    }
  }
  const events = {
    onMouseDown: handleClick,
    onMouseMove: handleClick,
    onMouseUp: handleClick,
    ...(touchSupported
      ? {
          onTouchStart: handleTouch,
          onTouchMove: handleTouch,
          onTouchEnd: handleTouch
        }
      : {})
  }

  return [touches, touchTime, events]
}

function distance({ pageX: x1, pageY: y1 }, { pageX: x2, pageY: y2 }) {
  return [x2 - x1, y2 - y1]
}

export default App

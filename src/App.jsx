import React, { useState, useEffect, useRef } from 'react'
import logo from './logo.svg'
import './App.css'

const { PI, sin, cos, sqrt, atan2 } = Math

const initialSpeed = (2 * PI) / 2000
const maxSpeed = 50 * initialSpeed

const cartesianFromEvent = e => [e.pageX, e.pageY]
const polarFromCartesian = ([x, y]) => {
  const r = size(distance([0, 0], [x, y]))
  const θ = atan2(y, x)
  return [r, θ]
}
const cartesianFromPolar = ([r, θ]) => [r * cos(θ), r * sin(θ)]

function App() {
  const [rotation, setRotation] = useState(0)
  const { touches, touchTime, events } = useTouchesAndTime()
  const prevTouchesRef = useRef([])
  const prevTouchTimeRef = useRef(0)
  const [speed, setSpeed] = useState(initialSpeed)
  useEffect(() => {
    if (touches.length > 0 && prevTouchesRef.current.length > 0) {
      const timeDiff = touchTime - prevTouchTimeRef.current
      const [, touchθ] = touches[0]
      const [, prevTouchθ] = prevTouchesRef.current[0]

      const Δθ = touchθ - prevTouchθ
      const ΔθΔt = Δθ / timeDiff
      if (ΔθΔt)
        setSpeed(prevSpeed =>
          Math.abs(prevSpeed + ΔθΔt) > maxSpeed ? prevSpeed : prevSpeed + ΔθΔt
        )
    }
    prevTouchesRef.current = touches
    prevTouchTimeRef.current = touchTime
  }, [touches])
  useInterval(() => {
    setSpeed(prevSpeed =>
      Math.abs(prevSpeed) < initialSpeed ? prevSpeed : prevSpeed * 0.99
    )
    setRotation(prevRotation => prevRotation + speed)
  }, 60 / 1000)
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
    const halfWindowSize = [window.innerWidth / 2, window.innerHeight / 2]
    setTouches(
      touches
        .map(cartesianFromEvent)
        .map(coords => coords.map((n, i) => n - halfWindowSize[i]))
        .map(polarFromCartesian)
    )
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

  return { touches, touchTime, events }
}

function distance([x1, y1], [x2, y2]) {
  return [x2 - x1, y2 - y1]
}
function size(vector) {
  return sqrt(vector[0] ** 2 + vector[1] ** 2)
}

export default App

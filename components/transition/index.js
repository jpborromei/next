import { useRef, useState, useEffect, cloneElement, Fragment } from 'react'

function Transition({ Component }) {
  const current = useRef()
  const next = useRef()
  const height = useRef()

  const [components, setComponents] = useState([Component])
  const [lifecycle, setLifecycle] = useState('starting')

  useEffect(() => {
    if (!Component) return
    if (components[0].render.displayName === Component.render.displayName)
      return
    setComponents((data) => [data[0], Component])
  }, [Component])

  useEffect(() => {
    if (components.length === 1 && lifecycle === 'starting') {
      window.scrollTo(0, 0)
    }
    if (components.length === 1 && lifecycle !== 'starting')
      return setLifecycle('resting')
    if (lifecycle === 'transitioning' || components.length < 1) return
    setLifecycle('transitioning')
    onAnimationStart()
  }, [components])

  const onAnimationStart = () => {
    height.current = current.current.getBounding()
    if (components.length === 1) {
      return current.current.animateIn({ from: '' }).then(() => {
        onAnimationEnded({ scrollTo: false })
      })
    }
    const from = components[0].render.displayName
    const to = components[1].render.displayName
    Promise.all([
      current.current.animateOut({ from, to }),
      next.current.animateIn({ from, to }),
    ]).then(() => {
      onAnimationEnded({ scrollTo: true })
    })
  }

  const onAnimationEnded = ({ scrollTo }) => {
    if (scrollTo) {
      window.scrollTo(0, 0)
    }
    current.current = next.current
    next.current = null
    if (components.length > 1) return setComponents((data) => [data[1]])
    if (components.length === 1) return setLifecycle('resting')
  }

  const getHeight = () => {
    return {
      height: lifecycle === 'transitioning' ? `${height.current}px` : null,
    }
  }

  const getPosition = (id) => {
    if (lifecycle === 'transitioning') {
      return id === 0
        ? {
            position: 'relative',
            zIndex: 2,
          }
        : {
            position: 'fixed',
            top: 0,
            zIndex: 3,
          }
    } else {
      return {
        position: 'static',
      }
    }
  }

  return (
    <main style={getHeight()}>
      <>
        {components.map((Page, id) => {
          return (
            Page !== null && (
              <Fragment key={Page.render.displayName}>
                <Page
                  ref={(node) =>
                    id === 0 ? (current.current = node) : (next.current = node)
                  }
                  style={getPosition(id)}
                  {...Page.props}
                />
              </Fragment>
            )
          )
        })}
      </>
    </main>
  )
}

export default Transition

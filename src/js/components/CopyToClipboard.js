import React from 'react'

import { toType } from './../helpers/util'

// clipboard icon
import { Clippy } from './icons'

// theme
import Theme from './../themes/getStyle'

export default class extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      copied: false
    }
  }

  copiedTimer = null

  componentWillUnmount () {
    if (this.copiedTimer) {
      clearTimeout(this.copiedTimer)
      this.copiedTimer = null
    }
  }

  copyToClipboardFallback = textToCopy => {
    const textArea = document.createElement('textarea')
    textArea.value = textToCopy
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }

  handleCopy = () => {
    const { clickCallback, src, namespace } = this.props

    const textToCopy = JSON.stringify(this.clipboardValue(src), null, '  ')

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).catch(() => {
        // Fallback for non-secure contexts (i.e. http)
        this.copyToClipboardFallback(textToCopy)
      })
    } else {
      // Fallback for old browsers and test environments
      this.copyToClipboardFallback(textToCopy)
    }

    this.copiedTimer = setTimeout(() => {
      this.setState({
        copied: false
      })
    }, 5500)

    this.setState({ copied: true }, () => {
      if (typeof clickCallback !== 'function') {
        return
      }

      clickCallback({
        src,
        namespace,
        name: namespace[namespace.length - 1]
      })
    })
  }

  getClippyIcon = () => {
    const { theme } = this.props

    if (this.state.copied) {
      return (
        <span>
          <Clippy className='copy-icon' {...Theme(theme, 'copy-icon')} />
          <span className='copied-icon'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              fill='green'
              viewBox='0 0 16 16'
            >
              <path d='M6.173 12.414l-3.89-3.89 1.414-1.414L6.173 9.586l6.364-6.364 1.414 1.414z' />
            </svg>
          </span>
        </span>
      )
    }

    return <Clippy className='copy-icon' {...Theme(theme, 'copy-icon')} />
  }

  clipboardValue = value => {
    const type = toType(value)
    switch (type) {
      case 'function':
      case 'regexp':
        return value.toString()
      default:
        return value
    }
  }

  render () {
    const { theme, hidden, rowHovered } = this.props
    const style = Theme(theme, 'copy-to-clipboard').style
    let display = 'inline'

    if (hidden) {
      display = 'none'
    }

    return (
      <span
        className='copy-to-clipboard-container'
        title='Copy to clipboard'
        style={{
          verticalAlign: 'top',
          display: rowHovered ? 'inline-block' : 'none'
        }}
      >
        <span
          style={{
            ...style,
            display
          }}
          onClick={this.handleCopy}
        >
          {this.getClippyIcon()}
        </span>
      </span>
    )
  }
}

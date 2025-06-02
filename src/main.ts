import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

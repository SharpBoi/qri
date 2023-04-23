import { ReactNode } from 'react'
import style from './index.scss'

type Item = [id: string, body: ReactNode]

export type ListProps = {
  content?: Item[]

  onClick?: (id: string) => void
}
export function List({ content, onClick }: ListProps) {
  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const id = e.currentTarget.dataset['id'] || ''

    onClick?.(id)
    console.log(id)
  }

  return (
    <div className={style.list}>
      {content?.map(([id, body]) => (
        <div key={id} data-id={id} className={style.item} onClick={handleClick}>
          {body}
        </div>
      ))}
    </div>
  )
}

import { useEffect, useState } from 'react'

export function useData() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('./data/people.json')
        .then((res) => res.json())
        .then((json) => {
          setData(json)
          setLoading(false)
        })
        .catch((err) => {
          console.error('Ошибка загрузки данных:', err)
          setLoading(false)
        })
  }, [])

  return { data, setData, loading }
}

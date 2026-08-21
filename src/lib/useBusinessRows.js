import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// Small shared hook for "select * from <table> where business_id = X"
// screens. Never invents rows: empty means empty, errors surface plainly.
export function useBusinessRows(table, businessId, { orderBy = 'created_at', ascending = false } = {}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    if (!businessId) {
      setRows([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    const { data, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .eq('business_id', businessId)
      .order(orderBy, { ascending })

    if (fetchError) {
      setError("We couldn't load this data. Please try again.")
      setRows([])
    } else {
      setRows(data || [])
    }
    setLoading(false)
  }, [table, businessId, orderBy, ascending])

  useEffect(() => {
    reload()
  }, [reload])

  return { rows, loading, error, reload }
}

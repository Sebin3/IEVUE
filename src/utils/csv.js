const FORMULA_PREFIX = /^[\s\u0000-\u001f]*[=+\-@]/

export function serializeCsvRows(rows) {
  return rows
    .map((row) =>
      row
        .map((value) => {
          const text = String(value ?? '')
          const safeText = FORMULA_PREFIX.test(text) ? `'${text}` : text
          return `"${safeText.replace(/"/g, '""')}"`
        })
        .join(','),
    )
    .join('\r\n')
}

import react from '@vitejs/plugin-react'

const BASE_URL = process.env.BASE_URL || '';

export default {
  base: `/${BASE_URL}`,
  plugins: [react()]
}
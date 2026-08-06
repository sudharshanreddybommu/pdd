export const validateOralImage = (base64Str) => {
  return new Promise((resolve) => {
    if (!base64Str || base64Str.length < 200) {
      resolve(false)
      return
    }

    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = 100
        canvas.height = 100
        ctx.drawImage(img, 0, 0, 100, 100)
        
        const imageData = ctx.getImageData(0, 0, 100, 100)
        const data = imageData.data
        let oralFlesh = 0
        let blueGreen = 0
        let neutralGrey = 0
        let total = data.length / 4

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const brightness = (r + g + b) / 3

          // Pink/Red oral mucosa / tongue / gums
          if (r > 105 && r > g + 10 && r > b + 10 && g < 190 && b < 170 && brightness > 40 && brightness < 215) {
            oralFlesh++
          }

          // Non-oral Blue/Green (clothes, outdoor, background)
          if ((g > r + 10 && g > b) || (b > r + 10 && b > g)) {
            blueGreen++
          }

          // Neutral grey / paper / objects
          if (Math.max(r, g, b) - Math.min(r, g, b) < 18 && brightness > 40 && brightness < 220) {
            neutralGrey++
          }
        }

        const oralRatio = oralFlesh / total
        const blueGreenRatio = blueGreen / total
        const greyRatio = neutralGrey / total

        // Allow medical blue/green backgrounds (common in dental clinics) up to 50%
        if (blueGreenRatio > 0.50) {
          resolve(false)
          return
        }

        // Reject documents/paper/grey objects (>45%)
        if (greyRatio > 0.45) {
          resolve(false)
          return
        }

        // Must have at least 8% pink/red oral tissue
        if (oralRatio < 0.08) {
          resolve(false)
          return
        }

        resolve(true)
      } catch {
        resolve(true)
      }
    }
    img.onerror = () => resolve(false)
    img.src = base64Str
  })
}

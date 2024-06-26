// Listen for messages from the main thread
addEventListener('message', (message) => {  
  if (message.data.command === 'correlation') {
    calculateCrossCorrelation(message.data.data1, message.data.data2, message.data.maxLag,  message.data.channel)
  }

  if (message.data.command === 'findpeak') {
    findPeakAndMean(message.data.array, message.data.channel)
  }
})


function calculateCrossCorrelation(data1, data2, maxLag, channel) {
  const n1 = data1.length, n2 = data2.length
  //console.log(maxLag)
  let crossCorrelations = new Array(maxLag + 1).fill(0)

  for (let lag = 0; lag <= maxLag; lag++) {
      let sum = 0
      for (let i = lag; i < n1 && (i - lag) < n2; i++) {
          sum += (data1[i]) * (data2[i - lag])
      }
      crossCorrelations[lag] = sum / (n1 - lag)
  }

  postMessage({correlation:crossCorrelations, channel: channel})
}

function findPeakAndMean(array, channel) {
  let peakValue = array[0]
  let peakIndex = 0
  let sum = 0

  for (let i = 1; i < array.length; i++) {
      if (array[i] > peakValue) {
          peakValue = array[i]
          peakIndex = i
      }
      sum += array[i]
  }
  const mean = sum / array.length
  postMessage({ peakValue, peakIndex, mean, channel })
}
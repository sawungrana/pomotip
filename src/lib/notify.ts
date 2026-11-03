let ctx: AudioContext | null = null

export function playChime(): void {
  try {
    ctx ??= new AudioContext()
    const notes = [880, 1108.73, 1318.51] // A5, C#6, E6
    notes.forEach((freq, i) => {
      const osc = ctx!.createOscillator()
      const gain = ctx!.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = ctx!.currentTime + i * 0.18
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
      osc.connect(gain)
      gain.connect(ctx!.destination)
      osc.start(t)
      osc.stop(t + 0.55)
    })
  } catch {
    // audio unavailable — silent fallback
  }
}

export async function requestNotifyPermission(): Promise<void> {
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      await Notification.requestPermission()
    } catch {
      // permission prompt unavailable
    }
  }
}

export function sendNotification(title: string, body: string): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, { body })
    } catch {
      // notification failed — ignore
    }
  }
}

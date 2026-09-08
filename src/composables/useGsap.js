import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(Flip, CustomEase)

// Misma curva que usa index.html para abrir/cerrar los modales.
export const customEase = CustomEase.create(
  'custom',
  'M0,0 C0.308,0.19 0.107,0.633 0.288,0.866 0.382,0.987 0.656,1 1,1',
)

// Curvas del cierre (index.html las crea dentro de closeModal).
export const closeEase1 = CustomEase.create('easeName1', '.56,.27,0,1')
export const closeEase2 = CustomEase.create('easeName2', '.37,.35,0,1')

export { gsap, Flip, CustomEase }

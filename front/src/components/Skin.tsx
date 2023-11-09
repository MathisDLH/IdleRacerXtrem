import { cars } from '../utils/cars.utils.ts'
import '../assets/styles/Skin.scss'
import { useAuth } from '../context/Auth.tsx'
import type skinInterface from '../interfaces/skin.interface.ts'

const Skin = (props: { skin: skinInterface }): JSX.Element => {
  const skin: skinInterface = props.skin
  const { user, setUser } = useAuth()


  function click (): void {
    console.log('change skin to: ' + skin.id)
	  if (user) {
		  user.skin_id = skin.id
		  setUser(user)
	  }
  }

  return (
		<div className={'skin prevent-select'}>
			<img src={cars[skin.id]}/>
			<button className={'btn-hover color-4'} onClick={click}>{skin.price}$</button>
		</div>
  )
}

export default Skin

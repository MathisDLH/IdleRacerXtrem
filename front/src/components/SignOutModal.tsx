import { useAuth } from '../context/Auth'

interface props {
  setModalVisible: (isVisible: boolean) => void
}

const SignOutModal = ({ setModalVisible }: props): JSX.Element => {
  const { signout } = useAuth()

  return (
      <div style={{ textAlign: 'center', padding: '1em' }}>
        <p>Are you sure you want to logout ?</p>
        <button onClick={() => {
          signout()
          setModalVisible(false)
        }} className='btn-hover color-4'>Yes</button>
        <p className='logout-exit' onClick={() => { setModalVisible(false) }}>No</p>
      </div>
  )
}

export default SignOutModal

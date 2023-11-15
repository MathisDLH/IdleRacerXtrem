import { useEffect, useState } from 'react'
import { getScores } from '../services/users.service'
import back from '../assets/images/game/icons/back.png'
import { type User } from '../interfaces/user.interface'
import '../assets/styles/ScoreTab.scss'
import carIcon from '../assets/images/auth/car_icon.png'
import { useAuth } from '../context/Auth'
import { IconButton } from '@mui/material'
import { Link } from 'react-router-dom'
import { calculateUnit } from '../enums/units'

const ScoreTab = (): JSX.Element => {
  const [scores, setScores] = useState<User[]>()

  const fetchScores = async (): Promise<void> => {
    const scoreFetched: User[] = await getScores()
    setScores(scoreFetched)
  }

  const { user } = useAuth()

  useEffect(() => {
    fetchScores()
  }, [])

  return (
    <div>
      <Link to='/'>
        <div className='left'>
          <IconButton className="icon" size="large">
            <img src={back} alt={''} />
          </IconButton>
        </div>
      </Link>
      <div className="score-tab">
        <div className='head-container'>
          <img alt='car_icon' src={carIcon} className='car-icon' />
          {user && <p>{user.name}</p>}
        </div>
        <h1 className="drag">Score Tab</h1>
        {scores && scores.length > 0
          ? (
            <table className="score-table">
              <thead>
                <tr>
                  <th>Player Name</th>
                  <th>Money</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => (
                  <tr key={index}>
                    <td>{score.name}</td>
                    <td>{`${score.money} ${calculateUnit(score.money_unite)}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            )
          : (
            <p>No scores available.</p>
            )}
      </div>
    </div>
  )
}

export default ScoreTab

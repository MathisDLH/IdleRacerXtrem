import React, { useEffect, useState } from 'react'
import { getScores } from '../services/users.service'
import { type User } from '../interfaces/user.interface'
import '../assets/styles/ScoreTab.scss'

const ScoreTab = (): JSX.Element => {
  const [scores, setScores] = useState<User[]>()

  const fetchScores = async (): Promise<void> => {
    const scoreFetched: User[] = await getScores()
    setScores(scoreFetched)
  }

  useEffect(() => {
    fetchScores()
  }, [])

  return (
    <div className="score-tab">
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
                <td>{`${score.money} ${score.money_unite}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
          )
        : (
        <p>No scores available.</p>
          )}
    </div>
  )
}

export default ScoreTab

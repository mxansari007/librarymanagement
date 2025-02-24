import React,{useState} from 'react'
import { Link } from 'react-router-dom'
import libraryImage from '../../assets/library-bg.png'
import styles from '../../styles/OwnerLoginSignUp.module.css'
import Button from '../../components/Button'
import Input from '../../components/Input'


const MemberLoginSignUp = () => {

  const [pageState, setPageState] = useState('login')



  return (
    <div className={styles.bg_style}>
      <div className={styles.bg_black_overlay_screen}></div>
      <div className={styles.container}>
        <div className={styles.flex_container}>
          <div className={styles.heading}>
          <h1>Library Management System</h1>
          <p>Change your role <Link to="/">here</Link></p>
          </div>
        </div>
        <div className={styles.flex_container}>
          <div className={styles.input_container}>
            {pageState==='signup'?<div>
             <h3>Create An Member Account</h3>
              <p>Start managing your own Library</p>
              <form>
              <Input type="text" placeholder="First Name" />
              <Input type="text" placeholder="Last Name" />
              <Input type="email" placeholder="Email" />
              <Input type="number" placeholder={"Enter Adhaar Number"} />
              <Input 
                type="file" 
                placeholder="Upload Adhaar Card" 
                accept="image/png, image/jpeg"   
                />
              <Input type="password" placeholder="Password" />
              <Input type="password" placeholder="Confirm Password" />
              <div className={styles.buttons}>
              <Button>Sign Up</Button>
              </div>
              <p>Already have an account? <a onClick={()=>setPageState('login')}>Login</a></p>
              </form>
             </div>:
             <div>
              <h3>Member Login</h3>
              <p>Start managing your own Library</p>
              <form>
              <label>Email</label>
              <Input type="email" placeholder="Email" />
              <label>Password</label>
              <Input type="password" placeholder="Password" />
              <div className={styles.buttons}>
              <Button>Login</Button>
              </div>
              <p>Don't have an account? <a onClick={()=>setPageState('signup')}>Create your Account</a></p>
              </form>
              </div>
             }
           </div>
        </div>
      </div>
    </div>
  )
}

export default MemberLoginSignUp 
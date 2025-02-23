import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import libraryImage from '../../assets/library-bg.png';
import styles from '../../styles/OwnerLoginSignUp.module.css';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useForm } from 'react-hook-form';
import { DevTool } from '@hookform/devtools';

const OwnerLoginSignUp = () => {
  const [pageState, setPageState] = useState('login');

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      plan_type: ''
    },
    mode: 'all',
  });

  const onSubmitSignUp = (data) => {
    console.log('Sign Up Data:', data);
  };

  const onSubmitLogin = (data) => {
    console.log('Login Data:', data);
  };

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
            {pageState === 'signup' ? (
              <div>
                <h3>Create An Owner Account</h3>
                <p>Start managing your own Library</p>
                <form onSubmit={handleSubmit(onSubmitSignUp)}>
                <Input
                    name="firstName"
                    type="text"
                    placeholder="First Name"
                    register={register} // ✅ Correctly passing register function
                    error={errors.firstName}
                    validation={{ required: 'First Name is required' }}
                />

                <Input
                    name="lastName"
                    type="text"
                    placeholder="Last Name"
                    register={register}
                    error={errors.lastName}
                    validation={{ required: 'Last Name is required' }}
                />

                <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    register={register}
                    error={errors.email}
                    validation={{
                        required: 'Email is required',
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                        },
                    }}
                />

                <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    register={register}
                    error={errors.password}
                    validation={{
                        required: 'Password is required',
                        minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters long',
                        },
                    }}
                />

                <Input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    register={register}
                    error={errors.confirmPassword}
                    validation={{
                        required: 'Confirm Password is required',
                        validate: (value) =>
                            value === watch('password') || 'Passwords do not match',
                    }}
                />

                <Button type="submit">Sign Up</Button>
            </form>

              </div>
            ) : (
              <div>
                <h3>Owner Login</h3>
                <p>Start managing your own Library</p>
                <form onSubmit={handleSubmit(onSubmitLogin)}>
                  <label>Email</label>
                  <Input
                    {...register('email', { required: 'Email is required' })}
                    type="email"
                    placeholder="Email"
                  />
                  <p className="error">{errors.email?.message}</p>

                  <label>Password</label>
                  <Input
                    {...register('password', { required: 'Password is required' })}
                    type="password"
                    placeholder="Password"
                  />
                  <p className="error">{errors.password?.message}</p>

                  <div className={styles.buttons}>
                    <Button type="submit">Login</Button>
                  </div>
                  <p>
                    Don't have an account?{' '}
                    <a onClick={() => setPageState('signup')}>Create your Account</a>
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <DevTool control={control} />
    </div>
  );
};

export default OwnerLoginSignUp;

import React from 'react';
import {useState,useMemo} from 'react'
import styles from '../styles/LocalGlobals.module.css'



const PageHeader = ({ title }) => {

    //fetch library from local storage user

    const user = JSON.parse(localStorage.getItem('user')) || {library: {}};

    const library = useMemo(() => user.library?.name || "No Library", [user]);


        return (
            <div className={styles.header}>
            <h1>{title}</h1>
            <p className='chip'>{library}</p>
        </div>
        )
    }

    export default PageHeader



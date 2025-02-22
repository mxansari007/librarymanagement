import {useState,useEffect} from 'react'
import Button from './Button';
import styles from '../styles/Pagination.module.css'
const Pagination = () => {
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(1);

    useEffect(() => {
        // Calculate the total number of pages based on the total number of items and items per page
        setTotalPages(Math.ceil(totalItems / itemsPerPage));
      }, [totalItems, itemsPerPage]);

    return (
        <div className={styles.pagination_container}>
            <Button disabled={currentPage < 2?true:false} variant={'secondary'} onClick={() => setCurrentPage(currentPage - 1)}>{'<'} Previous</Button>
            <span className={styles.current_page}>{ + currentPage}</span>
            <Button variant={'secondary'} onClick={() => setCurrentPage(currentPage + 1)}>Next {'>'}</Button>
        </div>
    )
    
}

export default Pagination
import {useState,useEffect, use} from 'react'
import styles from '../styles/Table.module.css';


const Table = ({ Data,ColumnDef}) => {

    const [columnDef, setColumnDef] = useState([]);
    const [data, setTableData] = useState([]);


    useEffect(() => {
        setTableData(Data);
    }, [Data]);

    useEffect(() => {
        setColumnDef(ColumnDef);

    }, [ColumnDef]);


    return (
        <table>
            <thead>
                <tr>
                    {columnDef.map((col, index) => (
                        <th key={index}>{col.header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, index) => (
                    <tr key={index}>
                        {columnDef.map((col, index) => (
                            <td key={index}>{row[col.key]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default Table;
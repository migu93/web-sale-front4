import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Tooltip, useMediaQuery, Checkbox, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText
} from '@mui/material';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import EditProductDialog from "./EditProductDialog";
import {ToastContainer} from "react-toastify";


const ProductsTable = () => {

    const [selected, setSelected] = useState([]);
    const [products, setProducts] = useState([]);
    const [open, setOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);

    const [openEdit, setOpenEdit] = useState(false); // для диалога редактирования
    const [openDelete, setOpenDelete] = useState(false); // для диалога удаления

    useEffect(() => {
        // Загрузка товаров с сервера
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/products/get-all`)
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the products!', error);
            });
    }, []);
    const truncate = (str, n) => {
        return (str.length > n) ? str.substr(0, n-1) + '...' : str;
    };


    const handleClose = () => {
        setOpen(false);
    };
    const handleEdit = (product) => {
        console.log("Editing product:", product);
        setEditingProduct(product);
        setOpenEdit(true);
    };

    const handleCloseEdit = () => {
        setOpenEdit(false);
    };

    const handleOpenDelete = () => {
        setOpenDelete(true);
    };


    const handleSave = (updatedProduct) => {
        // Обновляем локальное состояние
        setProducts(prevProducts => {
            return prevProducts.map(product =>
                product._id === updatedProduct._id ? updatedProduct : product
            );
        });
        // Закрываем диалоговое окно
        setOpenEdit(false);
    };

    const handleSelect = (event, id) => {
        setSelected(prevSelected => ({
            ...prevSelected,
            [id]: !prevSelected[id]
        }));
    };


    const handleCloseDialog = () => {
        setOpen(false);
    };

    const handleDeleteSelected = () => {
        const idsToDelete = Object.keys(selected).filter(id => selected[id]);
        if (idsToDelete.length > 0) {
            // Открываем диалоговое окно для подтверждения
            setOpen(true);
        }
    };

    const handleConfirmDelete = () => {
        const idsToDelete = Object.keys(selected).filter(id => selected[id]);
        // Здесь можно вызвать API для удаления
        idsToDelete.forEach(id => {
            axios.delete(`${process.env.REACT_APP_BASE_URL}/api/products/del/${id}`)
                .then(() => {
                    setProducts(products.filter(product => product._id !== id));
                    setSelected(prevSelected => {
                        const newSelected = { ...prevSelected };
                        delete newSelected[id];
                        return newSelected;
                    });
                })
                .catch(error => {
                    console.error('There was an error deleting the product!', error);
                });
        });
        setOpen(false); // Закрываем диалоговое окно
    };
    return (
        <>
            <TableContainer component={Paper}>
                <Typography variant="h6" gutterBottom>
                    Список товаров
                </Typography>
                <Button variant="contained" color="secondary" onClick={handleDeleteSelected}>
                    Удалить выбранные
                </Button>
                <Box sx={{ overflowX: 'auto' }}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox />
                                </TableCell>
                                <TableCell>Название</TableCell>
                                <TableCell>Краткое описание</TableCell>
                                <TableCell>Подробное описание</TableCell>
                                <TableCell>Применение</TableCell>
                                <TableCell>Основное изображение</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product._id}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={!!selected[product._id]}
                                            onChange={(event) => handleSelect(event, product._id)}
                                            color="default"  // Добавьте эту строку
                                        />
                                    </TableCell>
                                    <TableCell>{product.title}</TableCell>
                                    <TableCell>{product.shortDescription}</TableCell>
                                    <TableCell>{product.detailedDescription}</TableCell>
                                    <TableCell>{product.application.join(', ')}</TableCell>
                                    <TableCell><img src={`${process.env.REACT_APP_BASE_URL}${product.mainImage}`} alt={product.title} width={100} /></TableCell>
                                    <TableCell>
                                        <Button variant="contained" color="primary" onClick={() => handleEdit(product)}>
                                            <EditIcon/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </TableContainer>
            <Dialog
                open={open}
                onClose={handleCloseDialog}
            >
                <DialogTitle>Удаление товара</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Вы точно хотите удалить выбранные товары?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Отмена
                    </Button>
                    <Button onClick={handleConfirmDelete} color="secondary">
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>

            <EditProductDialog
                open={openEdit}
                onClose={handleCloseEdit}
                onSave={handleSave}
                product={editingProduct}
            />
            <ToastContainer />
        </>
    );
};

export default ProductsTable;

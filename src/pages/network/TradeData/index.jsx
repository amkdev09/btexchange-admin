import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    IconButton,
    Chip,
    Typography,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Modal,
    Card,
    CardContent,
    Grid,
    Stack,
    Tooltip,
} from '@mui/material';
import {
    Search,
    Visibility,
    Close,
    ArrowUpward,
    ArrowDownward,
} from '@mui/icons-material';
import { AppColors } from '../../../constant/appColors';
import useSnackbar from '../../../hooks/useSnackbar';
import networkService from '../../../services/networkService';
import BTLoader from '../../../components/Loader';
import tradeService from '../../../services/tradeService';

const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
};

const formatAmount = (amount) => {
    if (amount == null || amount === '') return 'N/A';
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
    }).format(amount);
};

const TradeDataPage = () => {
    const { showSnackbar } = useSnackbar();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [statusFilter, setStatusFilter] = useState('');
    const [pairFilter, setPairFilter] = useState('');

    const [selectedTrade, setSelectedTrade] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchTradeData = async () => {
        try {
            setLoading(true);
            const params = {
                page: page + 1,
                limit: rowsPerPage,
            };
            if (statusFilter) params.status = statusFilter;
            if (pairFilter.trim()) params.pair = pairFilter.trim();

            const response = await tradeService.getTradeData(params);
            if (response.success) {
                setData(response.data || []);
                const pag = response.pagination || {};
                setTotal(pag.total ?? 0);
                setTotalPages(pag.totalPages ?? 0);
            } else {
                showSnackbar('Failed to fetch trade data', 'error');
            }
        } catch (error) {
            console.error('Error fetching trade data:', error);
            showSnackbar('Error fetching trade data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTradeData();
    }, [page, rowsPerPage, statusFilter, pairFilter]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewDetails = (row) => {
        setSelectedTrade(row);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setSelectedTrade(null);
    };

    const getStatusChip = (status) => {
        const config = {
            WIN: { label: 'Win', bg: `${AppColors.SUCCESS}30`, color: AppColors.SUCCESS },
            LOSS: { label: 'Loss', bg: `${AppColors.ERROR}30`, color: AppColors.ERROR },
            OPEN: { label: 'Open', bg: `${AppColors.GOLD_DARK}30`, color: AppColors.GOLD_DARK },
        };
        const c = config[status] || { label: status || '—', bg: `${AppColors.TXT_SUB}30`, color: AppColors.TXT_SUB };
        return (
            <Chip
                label={c.label}
                size="small"
                sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600 }}
            />
        );
    };

    const getDirectionChip = (direction) => {
        const isUp = direction === 'UP';
        return (
            <Chip
                size="small"
                icon={isUp ? <ArrowUpward sx={{ fontSize: 14 }} /> : <ArrowDownward sx={{ fontSize: 14 }} />}
                label={direction || '—'}
                sx={{
                    fontWeight: 600,
                    bgcolor: isUp ? `${AppColors.SUCCESS}18` : `${AppColors.ERROR}18`,
                    color: isUp ? AppColors.SUCCESS : AppColors.ERROR,
                    '& .MuiChip-icon': { color: 'inherit' },
                }}
            />
        );
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: { xs: 1, md: 2 } }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        color: AppColors.TXT_MAIN,
                        background: `linear-gradient(45deg, ${AppColors.GOLD_DARK}, ${AppColors.GOLD_LIGHT})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Trade Data
                </Typography>
                <Typography
                    variant="body1"
                    sx={{ color: AppColors.TXT_SUB, fontWeight: 400 }}
                >
                    Admin-created dummy trades shown to all users (trade feed, demo)
                </Typography>
            </Box>

            {/* Filters & Table */}
            <Paper
                elevation={0}
                sx={{
                    backgroundColor: AppColors.BG_CARD,
                    border: `1px solid ${AppColors.BG_SECONDARY}`,
                    borderRadius: 3,
                    pt: { xs: 1, md: 2 },
                }}
            >
                <Grid container spacing={2} px={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Filter by pair (e.g. BTC-USD)"
                            value={pairFilter}
                            onChange={(e) => setPairFilter(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: AppColors.GOLD_DARK }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    backgroundColor: AppColors.BG_SECONDARY,
                                    borderRadius: 2,
                                    '& fieldset': { border: 'none' },
                                    '& input': { color: AppColors.TXT_MAIN },
                                },
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: AppColors.TXT_SUB }}>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                label="Status"
                                sx={{
                                    backgroundColor: AppColors.BG_SECONDARY,
                                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    '& .MuiSelect-select': { color: AppColors.TXT_MAIN },
                                }}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="OPEN">OPEN</MenuItem>
                                <MenuItem value="WIN">WIN</MenuItem>
                                <MenuItem value="LOSS">LOSS</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                <Box sx={{ mt: { xs: 1, md: 1.5 } }}>
                    <TableContainer>
                        <Table
                            sx={{
                                '& .MuiTableCell-root': { p: { xs: 1, md: 1.5 } },
                                '& .MuiTableCell-head': { p: { xs: 1, md: 1.5 } },
                                '& .MuiTableCell-body': { p: { xs: 1, md: 1.5 } },
                            }}
                        >
                            <TableHead>
                                <TableRow sx={{ backgroundColor: AppColors.BG_SECONDARY }}>
                                    <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>Pair</TableCell>
                                    <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>Direction</TableCell>
                                    <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }} align="right">Gross Amount</TableCell>
                                    <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }} align="right">Payout</TableCell>
                                    <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>Start Time</TableCell>
                                    <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }} align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: { xs: 2, md: 4 } }}>
                                            <BTLoader />
                                        </TableCell>
                                    </TableRow>
                                ) : data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4, color: AppColors.TXT_SUB }}>
                                            No trade data found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.map((row) => (
                                        <TableRow
                                            key={row._id}
                                            hover
                                            sx={{
                                                '&:hover': { backgroundColor: `${AppColors.GOLD_DARK}05` },
                                            }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: AppColors.TXT_MAIN, fontWeight: 500 }}>
                                                    {row.pair || '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{getDirectionChip(row.direction)}</TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" sx={{ color: AppColors.GOLD_DARK, fontWeight: 600 }}>
                                                    ${formatAmount(row.grossAmount)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{getStatusChip(row.status)}</TableCell>
                                            <TableCell align="right">
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: row.status === 'WIN' ? AppColors.SUCCESS : row.status === 'LOSS' ? AppColors.ERROR : AppColors.TXT_MAIN,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    ${formatAmount(row.payout)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: AppColors.TXT_SUB }}>
                                                    {formatDate(row.startTime)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={1} justifyContent="center">
                                                    <Tooltip title="View Details">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleViewDetails(row)}
                                                            sx={{
                                                                color: AppColors.GOLD_DARK,
                                                                '&:hover': { backgroundColor: `${AppColors.GOLD_DARK}20` },
                                                            }}
                                                        >
                                                            <Visibility fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={total}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[10, 20, 25, 50]}
                        sx={{
                            borderTop: `1px solid ${AppColors.BG_SECONDARY}`,
                            backgroundColor: AppColors.BG_CARD,
                            '& .MuiTablePagination-toolbar': { color: AppColors.TXT_MAIN },
                            '& .MuiTablePagination-select': { color: AppColors.TXT_MAIN },
                            '& .MuiTablePagination-actions button': { color: AppColors.GOLD_DARK },
                        }}
                    />
                </Box>
            </Paper>

            {/* Detail Modal – rest of fields in card */}
            <Modal
                open={modalOpen}
                onClose={handleModalClose}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 1, md: 1.5 },
                }}
            >
                <Card
                    sx={{
                        backgroundColor: AppColors.BG_CARD,
                        border: `1px solid ${AppColors.BG_SECONDARY}`,
                        borderRadius: 3,
                        maxWidth: { xs: '100%', md: 560 },
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    }}
                >
                    <CardContent sx={{ p: { xs: 1, md: 1.5 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ color: AppColors.GOLD_DARK, fontWeight: 700 }}>
                                Trade Details
                            </Typography>
                            <IconButton
                                onClick={handleModalClose}
                                sx={{
                                    color: AppColors.TXT_SUB,
                                    '&:hover': { backgroundColor: `${AppColors.ERROR}20`, color: AppColors.ERROR },
                                }}
                            >
                                <Close />
                            </IconButton>
                        </Box>

                        {selectedTrade && (
                            <>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem label="Pair" value={selectedTrade.pair} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem label="Direction" value={selectedTrade.direction} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem label="Status" value={getStatusChip(selectedTrade.status)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem label="Gross Amount" value={`$${formatAmount(selectedTrade.grossAmount)}`} highlight />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem label="Fee Amount" value={`$${formatAmount(selectedTrade.feeAmount)}`} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem label="Net Trade Amount" value={`$${formatAmount(selectedTrade.netTradeAmount)}`} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem label="Entry Price" value={`$${formatAmount(selectedTrade.entryPrice)}`} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem label="Exit Price" value={`$${formatAmount(selectedTrade.exitPrice)}`} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem label="Payout" value={`$${formatAmount(selectedTrade.payout)}`} highlight />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem label="Start Time" value={formatDate(selectedTrade.startTime)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem label="Expiry Time" value={formatDate(selectedTrade.expiryTime)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem
                                            label="Dummy"
                                            value={
                                                <Chip
                                                    size="small"
                                                    label={selectedTrade.isDummy ? 'Yes' : 'No'}
                                                    sx={{
                                                        bgcolor: selectedTrade.isDummy ? `${AppColors.GOLD_DARK}30` : `${AppColors.TXT_SUB}30`,
                                                        color: selectedTrade.isDummy ? AppColors.GOLD_DARK : AppColors.TXT_SUB,
                                                    }}
                                                />
                                            }
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem label="Created" value={formatDate(selectedTrade.createdAt)} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <DetailItem label="Updated" value={formatDate(selectedTrade.updatedAt)} />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <DetailItem label="ID" value={selectedTrade._id} mono />
                                    </Grid>
                                </Grid>
                            </>
                        )}
                    </CardContent>
                </Card>
            </Modal>
        </Box>
    );
};

const DetailItem = ({ label, value, highlight, mono }) => {
    return (
    <Box
        sx={{
            p: { xs: 1, md: 1.5 },
            backgroundColor: AppColors.BG_SECONDARY,
            borderRadius: 2,
        }}
    >
        <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase' }}>
            {label}
        </Typography>
        <Box sx={{ mt: 0.5 }}>
            {typeof value === 'string' || typeof value === 'number' ? (
                <Typography
                    variant="body2"
                    sx={{
                        color: highlight ? AppColors.GOLD_DARK : AppColors.TXT_MAIN,
                        fontWeight: highlight ? 600 : 400,
                        fontFamily: mono ? 'monospace' : 'inherit',
                        fontSize: mono ? '0.75rem' : undefined,
                    }}
                >
                    {value}
                </Typography>
            ) : (
                value
            )}
        </Box>
    </Box>
    );
};

export default TradeDataPage;

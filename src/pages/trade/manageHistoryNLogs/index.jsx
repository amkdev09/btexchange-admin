import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Tabs,
  Tab,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Card,
  CardContent,
} from '@mui/material';
import {
  TrendingUp,
  ArrowDownward,
  ArrowUpward,
  GetApp,
  Clear,
  Search,
  History,
  ShowChart,
} from '@mui/icons-material';
import tradeService from '../../../services/tradeService';
import { AppColors } from '../../../constant/appColors';
import BTLoader from '../../../components/Loader';
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const ManageHistoryNLogs = () => {
  const [activeTab, setActiveTab] = useState('trades');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    userId: '',
    uid: '',
    email: '',
    status: '',
    type: '',
    pair: '',
    startDate: dayjs(),
    endDate: dayjs()
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  const tabs = [
    { id: 'trades', label: 'Trades History', icon: <ShowChart /> },
    { id: 'income', label: 'Income History', icon: <TrendingUp /> },
    { id: 'deposits', label: 'Deposits History', icon: <ArrowDownward /> },
    { id: 'withdrawals', label: 'Withdrawals History', icon: <ArrowUpward /> }
  ];

  useEffect(() => {
    loadHistoryData();
  }, [activeTab, pagination.page, filters]);

  const loadHistoryData = async () => {
    setLoading(true);
    try {
      let response;
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        )
      };

      switch (activeTab) {
        case 'trades':
          response = await tradeService.getTradesHistory(params);
          break;
        case 'income':
          response = await tradeService.getIncomeHistory(params);
          break;
        case 'deposits':
          response = await tradeService.getDepositsHistory(params);
          break;
        case 'withdrawals':
          response = await tradeService.getWithdrawalsHistory(params);
          break;
        default:
          response = { data: [], total: 0 };
      }

      setData(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        totalPages: Math.ceil((response.total || 0) / pagination.limit)
      }));
    } catch (error) {
      console.error('Error loading history data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.includes('@')) {
      handleFilterChange('email', value);
    } else if (value.match(/^\d+$/)) {
      handleFilterChange('uid', value);
    } else {
      handleFilterChange('userId', value);
    }
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      uid: '',
      email: '',
      status: '',
      type: '',
      pair: '',
      startDate: '',
      endDate: ''
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount);
  };

  const exportData = async () => {
    setExportLoading(true);
    try {
      const allData = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const params = {
          page: currentPage,
          limit: 1000,
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== '')
          )
        };

        let response;
        switch (activeTab) {
          case 'trades':
            response = await tradeService.getTradesHistory(params);
            break;
          case 'income':
            response = await tradeService.getIncomeHistory(params);
            break;
          case 'deposits':
            response = await tradeService.getDepositsHistory(params);
            break;
          case 'withdrawals':
            response = await tradeService.getWithdrawalsHistory(params);
            break;
        }

        if (response.data && response.data.length > 0) {
          allData.push(...response.data);
          currentPage++;
          hasMore = response.data.length === 1000;
        } else {
          hasMore = false;
        }
      }

      downloadCSV(allData, `${activeTab}_history_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const downloadCSV = (data, filename) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      WIN: { color: 'success', label: 'WIN' },
      LOSS: { color: 'error', label: 'LOSS' },
      OPEN: { color: 'warning', label: 'OPEN' },
      SUCCESS: { color: 'success', label: 'Success' },
      PENDING: { color: 'warning', label: 'Pending' },
      FAILED: { color: 'error', label: 'Failed' },
      COMPLETED: { color: 'success', label: 'Completed' },
      PROCESSING: { color: 'warning', label: 'Processing' }
    };

    const config = statusConfig[status] || { color: 'default', label: status };

    return (
      <Chip
        label={config.label}
        size="small"
        color={config.color}
        sx={{
          fontWeight: 600,
          fontSize: '0.75rem',
          '& .MuiChip-label': {
            px: 1.5
          }
        }}
      />
    );
  };

  const renderMobileCard = (item, index) => {
    const cardData = {
      trades: {
        id: item.userId || 'N/A',
        status: item.status,
        fields: [
          { label: 'Pair', value: item.pair || 'N/A' },
          { label: 'Amount', value: `$${formatAmount(item.amount)}`, highlight: true },
          { label: 'Opened', value: formatDate(item.createdAt) },
          { label: 'Profit/Loss', value: item.profit ? (item.profit > 0 ? '+' : '') + formatAmount(item.profit) : 'N/A', highlight: true, profit: item.profit }
        ]
      },
      income: {
        id: item.userId || 'N/A',
        status: 'SUCCESS',
        fields: [
          { label: 'Type', value: item.type || 'N/A' },
          { label: 'Amount', value: `+$${formatAmount(item.amount)}`, highlight: true, positive: true },
          { label: 'From User', value: item.fromUserId || 'N/A' },
          { label: 'Date', value: formatDate(item.createdAt) }
        ]
      },
      deposits: {
        id: item.userId || 'N/A',
        status: item.status,
        fields: [
          { label: 'Amount', value: `$${formatAmount(item.amount)}`, highlight: true },
          { label: 'Chain', value: item.chain || 'N/A' },
          { label: 'Date', value: formatDate(item.createdAt) },
          { label: 'TX Hash', value: item.txHash ? `${item.txHash.slice(0, 8)}...` : 'N/A' }
        ]
      },
      withdrawals: {
        id: item.userId || 'N/A',
        status: item.status,
        fields: [
          { label: 'Amount', value: `-$${formatAmount(item.amount)}`, highlight: true, negative: true },
          { label: 'Type', value: item.type || 'N/A' },
          { label: 'Date', value: formatDate(item.createdAt) },
          { label: 'TX Hash', value: item.txHash ? `${item.txHash.slice(0, 8)}...` : 'N/A' }
        ]
      }
    };

    const card = cardData[activeTab];

    return (
      <Card
        key={index}
        sx={{
          mb: 2,
          bgcolor: AppColors.BG_CARD,
          border: `1px solid ${AppColors.BG_SECONDARY}`,
          borderRadius: 2,
          '&:hover': {
            borderColor: AppColors.GOLD_DARK,
            boxShadow: `0 4px 12px ${AppColors.GOLD_DARK}20`
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1.5, borderBottom: `1px solid ${AppColors.BG_SECONDARY}` }}>
            <Typography variant="body2" sx={{ color: AppColors.GOLD_DARK, fontWeight: 600 }}>
              ID: {card.id}
            </Typography>
            {getStatusChip(card.status)}
          </Box>
          <Grid container spacing={2}>
            {card.fields.map((field, idx) => (
              <Grid size={{ xs: 6 }} key={idx}>
                <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {field.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: field.highlight
                      ? field.positive
                        ? AppColors.SUCCESS
                        : field.negative
                          ? AppColors.ERROR
                          : field.profit && field.profit > 0
                            ? AppColors.SUCCESS
                            : field.profit && field.profit < 0
                              ? AppColors.ERROR
                              : AppColors.GOLD_DARK
                      : AppColors.TXT_MAIN,
                    fontWeight: field.highlight ? 600 : 400,
                    fontFamily: field.label === 'TX Hash' ? 'monospace' : 'inherit'
                  }}
                >
                  {field.value}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderFilters = () => (
    <DashboardCard
      title="Filters"
      subtitle="Refine your search criteria"
      sx={{ mb: { xs: 1, md: 1.5 } }}
    >
      <Grid container spacing={{ xs: 1, md: 1.5 }}>
        <Grid size={{ xs: 6, md: 4 }}>
          <TextField
            id="outlined-basic"
            label="Search by User ID, UID, or Email"
            fullWidth
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
          />
        </Grid>

        {activeTab === 'trades' && (
          <>
            <Grid size={{ xs: 6, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: AppColors.TXT_SUB, '&.Mui-focused': { color: AppColors.GOLD_DARK } }}>
                  Status
                </InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                  sx={{
                    bgcolor: AppColors.BG_SECONDARY,
                    color: AppColors.TXT_MAIN,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: AppColors.BG_SECONDARY,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: AppColors.GOLD_DARK,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: AppColors.GOLD_DARK,
                    },
                    '& .MuiSvgIcon-root': {
                      color: AppColors.TXT_SUB,
                    },
                  }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="WIN">WIN</MenuItem>
                  <MenuItem value="LOSS">LOSS</MenuItem>
                  <MenuItem value="OPEN">OPEN</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 2 }}>
              <TextField
                id="outlined-basic"
                variant="outlined"
                label="Trading Pair"
                value={filters.pair}
                onChange={(e) => handleFilterChange('pair', e.target.value)}
                fullWidth
              />
            </Grid>
          </>
        )}

        {activeTab === 'income' && (
          <Grid size={{ xs: 6, sm: 6, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: AppColors.TXT_SUB, '&.Mui-focused': { color: AppColors.GOLD_DARK } }}>
                Income Type
              </InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                label="Income Type"
                sx={{
                  bgcolor: AppColors.BG_SECONDARY,
                  color: AppColors.TXT_MAIN,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: AppColors.BG_SECONDARY,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: AppColors.GOLD_DARK,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: AppColors.GOLD_DARK,
                  },
                  '& .MuiSvgIcon-root': {
                    color: AppColors.TXT_SUB,
                  },
                }}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="REFERRAL_BONUS">Referral Bonus</MenuItem>
                <MenuItem value="LEVEL_INCOME">Level Income</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        {(activeTab === 'deposits' || activeTab === 'withdrawals') && (
          <Grid size={{ xs: 6, sm: 6, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: AppColors.TXT_SUB, '&.Mui-focused': { color: AppColors.GOLD_DARK } }}>
                Status
              </InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
                sx={{
                  bgcolor: AppColors.BG_SECONDARY,
                  color: AppColors.TXT_MAIN,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: AppColors.BG_SECONDARY,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: AppColors.GOLD_DARK,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: AppColors.GOLD_DARK,
                  },
                  '& .MuiSvgIcon-root': {
                    color: AppColors.TXT_SUB,
                  },
                }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="SUCCESS">Success</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        {activeTab === 'withdrawals' && (
          <Grid size={{ xs: 6, sm: 6, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: AppColors.TXT_SUB, '&.Mui-focused': { color: AppColors.GOLD_DARK } }}>
                Withdrawal Type
              </InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                label="Withdrawal Type"
                sx={{
                  bgcolor: AppColors.BG_SECONDARY,
                  color: AppColors.TXT_MAIN,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: AppColors.BG_SECONDARY,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: AppColors.GOLD_DARK,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: AppColors.GOLD_DARK,
                  },
                  '& .MuiSvgIcon-root': {
                    color: AppColors.TXT_SUB,
                  },
                }}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="WITHDRAW_WINNINGS">Withdraw Winnings</MenuItem>
                <MenuItem value="WITHDRAW_WORKING">Withdraw Working</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        <Grid size={{ xs: 6, sm: 6, md: 2 }}>
          <DatePicker
            label="Start Date"
            value={filters.startDate}
            onChange={(newValue) => handleFilterChange('startDate', newValue)}
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 2 }}>
          <DatePicker
            label="End Date"
            value={filters.endDate}
            onChange={(newValue) => handleFilterChange('endDate', newValue)}
          />
        </Grid>
      </Grid>
      <Button
        onClick={clearFilters}
        variant="outlined"
        startIcon={<Clear />}
        sx={{
          mt: { xs: 1, md: 1.5 },
          alignSelf: 'flex-end',
          borderColor: AppColors.GOLD_DARK,
          color: AppColors.GOLD_DARK,
          '&:hover': {
            borderColor: AppColors.GOLD_LIGHT,
            bgcolor: `${AppColors.GOLD_DARK}10`,
          },
        }}
      >
        Clear Filters
      </Button>
    </DashboardCard>
  );

  const renderTradeRow = (item, index) => (
    <TableRow
      key={item.id || index}
      sx={{
        bgcolor: index % 2 === 0 ? AppColors.BG_CARD : AppColors.BG_SECONDARY,
        '&:hover': {
          bgcolor: `${AppColors.GOLD_DARK}10`,
        },
      }}
    >
      <TableCell sx={{ color: AppColors.TXT_MAIN }}>{item.userId || 'N/A'}</TableCell>
      <TableCell sx={{ color: AppColors.TXT_MAIN }}>{item.pair || 'N/A'}</TableCell>
      <TableCell>
        <Typography sx={{ color: AppColors.GOLD_DARK, fontWeight: 600 }}>
          ${formatAmount(item.amount)}
        </Typography>
      </TableCell>
      <TableCell>{getStatusChip(item.status)}</TableCell>
      <TableCell sx={{ color: AppColors.TXT_SUB }}>{formatDate(item.createdAt)}</TableCell>
      <TableCell sx={{ color: AppColors.TXT_SUB }}>{formatDate(item.closedAt)}</TableCell>
      <TableCell>
        <Typography sx={{
          color: item.status === 'WIN' ? AppColors.SUCCESS : item.status === 'LOSS' ? AppColors.ERROR : AppColors.GOLD_DARK,
          fontWeight: 600
        }}>
          {item.profit ? (item.profit > 0 ? '+' : '') + formatAmount(item.profit) : 'N/A'}
        </Typography>
      </TableCell>
    </TableRow>
  );

  const renderIncomeRow = (item, index) => (
    <TableRow
      key={item.id || index}
      sx={{
        bgcolor: index % 2 === 0 ? AppColors.BG_CARD : AppColors.BG_SECONDARY,
        '&:hover': {
          bgcolor: `${AppColors.GOLD_DARK}10`,
        },
      }}
    >
      <TableCell sx={{ color: AppColors.TXT_MAIN }}>{item.userId || 'N/A'}</TableCell>
      <TableCell sx={{ color: AppColors.TXT_MAIN }}>{item.type || 'N/A'}</TableCell>
      <TableCell>
        <Typography sx={{ color: AppColors.SUCCESS, fontWeight: 600 }}>
          +${formatAmount(item.amount)}
        </Typography>
      </TableCell>
      <TableCell sx={{ color: AppColors.TXT_MAIN }}>{item.fromUserId || 'N/A'}</TableCell>
      <TableCell sx={{ color: AppColors.TXT_SUB }}>{formatDate(item.createdAt)}</TableCell>
      <TableCell sx={{ color: AppColors.TXT_SUB }}>{item.description || 'N/A'}</TableCell>
    </TableRow>
  );

  const renderDepositRow = (item, index) => (
    <TableRow
      key={item.id || index}
      sx={{
        bgcolor: index % 2 === 0 ? AppColors.BG_CARD : AppColors.BG_SECONDARY,
        '&:hover': {
          bgcolor: `${AppColors.GOLD_DARK}10`,
        },
      }}
    >
      <TableCell sx={{ color: AppColors.TXT_MAIN }}>{item.userId || 'N/A'}</TableCell>
      <TableCell>
        <Typography sx={{ color: AppColors.GOLD_DARK, fontWeight: 600 }}>
          ${formatAmount(item.amount)}
        </Typography>
      </TableCell>
      <TableCell sx={{ color: AppColors.TXT_MAIN }}>{item.chain || 'N/A'}</TableCell>
      <TableCell>
        <Typography sx={{ color: AppColors.TXT_SUB, fontFamily: 'monospace', fontSize: '0.875rem' }}>
          {item.address ? `${item.address.slice(0, 8)}...${item.address.slice(-6)}` : 'N/A'}
        </Typography>
      </TableCell>
      <TableCell>{getStatusChip(item.status)}</TableCell>
      <TableCell sx={{ color: AppColors.TXT_SUB }}>{formatDate(item.createdAt)}</TableCell>
      <TableCell>
        {item.txHash ? (
          <Typography sx={{ color: AppColors.TXT_SUB, fontFamily: 'monospace', fontSize: '0.875rem' }}>
            {`${item.txHash.slice(0, 8)}...${item.txHash.slice(-6)}`}
          </Typography>
        ) : (
          'N/A'
        )}
      </TableCell>
    </TableRow>
  );

  const renderWithdrawalRow = (item, index) => (
    <TableRow
      key={item.id || index}
      sx={{
        bgcolor: index % 2 === 0 ? AppColors.BG_CARD : AppColors.BG_SECONDARY,
        '&:hover': {
          bgcolor: `${AppColors.GOLD_DARK}10`,
        },
      }}
    >
      <TableCell sx={{ color: AppColors.TXT_MAIN }}>{item.userId || 'N/A'}</TableCell>
      <TableCell>
        <Typography sx={{ color: AppColors.ERROR, fontWeight: 600 }}>
          -${formatAmount(item.amount)}
        </Typography>
      </TableCell>
      <TableCell sx={{ color: AppColors.TXT_MAIN }}>{item.type || 'N/A'}</TableCell>
      <TableCell>
        <Typography sx={{ color: AppColors.TXT_SUB, fontFamily: 'monospace', fontSize: '0.875rem' }}>
          {item.toAddress ? `${item.toAddress.slice(0, 8)}...${item.toAddress.slice(-6)}` : 'N/A'}
        </Typography>
      </TableCell>
      <TableCell>{getStatusChip(item.status)}</TableCell>
      <TableCell sx={{ color: AppColors.TXT_SUB }}>{formatDate(item.createdAt)}</TableCell>
      <TableCell>
        {item.txHash ? (
          <Typography sx={{ color: AppColors.TXT_SUB, fontFamily: 'monospace', fontSize: '0.875rem' }}>
            {`${item.txHash.slice(0, 8)}...${item.txHash.slice(-6)}`}
          </Typography>
        ) : (
          'N/A'
        )}
      </TableCell>
    </TableRow>
  );

  const renderTableHeaders = () => {
    const headers = {
      trades: ['User ID', 'Pair', 'Amount', 'Status', 'Opened', 'Closed', 'Profit/Loss'],
      income: ['User ID', 'Type', 'Amount', 'From User', 'Date', 'Description'],
      deposits: ['User ID', 'Amount', 'Chain', 'Address', 'Status', 'Date', 'TX Hash'],
      withdrawals: ['User ID', 'Amount', 'Type', 'To Address', 'Status', 'Date', 'TX Hash']
    };

    return (
      <TableHead>
        <TableRow sx={{ bgcolor: `${AppColors.GOLD_DARK}20` }}>
          {headers[activeTab]?.map((header, index) => (
            <TableCell
              key={index}
              sx={{
                color: AppColors.GOLD_DARK,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontSize: '0.875rem',
                borderBottom: `2px solid ${AppColors.GOLD_DARK}`
              }}
            >
              {header}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  };

  const renderTableBody = () => {
    const renderFunctions = {
      trades: renderTradeRow,
      income: renderIncomeRow,
      deposits: renderDepositRow,
      withdrawals: renderWithdrawalRow
    };

    const renderFunction = renderFunctions[activeTab];

    return (
      <TableBody>
        {data.map((item, index) => renderFunction(item, index))}
      </TableBody>
    );
  };

  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  if (loading && data.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          bgcolor: AppColors.BG_MAIN
        }}
      >
        <BTLoader />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: AppColors.BG_MAIN, minHeight: '100vh' }}>
      {/* MainHeader */}
      <Box sx={{ mb: { xs: 1, md: 1.5 } }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 1, md: 1.5 }
        }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: AppColors.TXT_MAIN,
                mb: { xs: 0.5, md: 1 },
                background: `linear-gradient(45deg, ${AppColors.GOLD_DARK}, ${AppColors.GOLD_LIGHT})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              History & Logs Management
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: AppColors.TXT_SUB,
                fontWeight: 400
              }}
            >
              Monitor and analyze all platform activities
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.5 }, flexWrap: 'wrap' }}>
            <Button
              onClick={exportData}
              variant="outlined"
              startIcon={<GetApp />}
              sx={{
                px: { xs: 1, md: 1.5 },
                py: { xs: 0.27, md: 0.5 },
                borderColor: AppColors.GOLD_DARK,
                color: AppColors.GOLD_DARK,
                '&:hover': {
                  borderColor: AppColors.GOLD_LIGHT,
                  color: AppColors.GOLD_LIGHT,
                  bgcolor: `${AppColors.GOLD_DARK}10`
                }
              }}
            >
              {exportLoading ? 'Exporting...' : 'Export CSV'}
            </Button>
            <Paper
              elevation={0}
              sx={{
                bgcolor: AppColors.BG_CARD,
                border: `1px solid ${AppColors.BG_SECONDARY}`,
                px: { xs: 1, md: 1.5 },
                py: { xs: 0.5, md: 0.75 },
                borderRadius: 2,
                display: 'flex',
                gap: { xs: 0.5, md: 1 },
              }}
            >
              <Typography variant="caption" sx={{ color: AppColors.TXT_SUB }}>
                Total Records
              </Typography>
              <Typography variant="h6" sx={{ color: AppColors.GOLD_DARK, fontWeight: 600 }}>
                {pagination.total}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => {
          setActiveTab(newValue);
          setPagination(prev => ({ ...prev, page: 1 }));
        }}
        sx={{
          bgcolor: AppColors.BG_CARD,
          border: `1px solid ${AppColors.BG_SECONDARY}`,
          borderRadius: 3,
          mb: { xs: 1, md: 1.5 },
          minHeight: 'auto',
          '& .MuiTabs-indicator': {
            backgroundColor: AppColors.GOLD_DARK,
          },
          '& .MuiTab-root': {
            color: AppColors.TXT_SUB,
            minHeight: 'auto',
            padding: { xs: '8px 12px', md: '10px 16px' },
            fontSize: { xs: '0.75rem', md: '0.875rem' },
            textTransform: 'none',
            fontWeight: 500,
            '& .MuiTab-iconWrapper': {
              marginRight: '10px',
              fontSize: { xs: '1rem', md: '1.125rem' },
            },
            '&.Mui-selected': {
              color: AppColors.GOLD_DARK,
              fontWeight: 600,
            },
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            value={tab.id}
            icon={tab.icon}
            label={tab.label}
            iconPosition="start"
          />
        ))}
      </Tabs>

      {/* Filters */}
      {renderFilters()}

      {/* Data Display */}
      <DashboardCard
        title={`${tabs.find(t => t.id === activeTab)?.label}`}
        subtitle={`Showing ${data.length} of ${pagination.total} records`}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <BTLoader />
          </Box>
        ) : data.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <History sx={{ fontSize: 64, color: AppColors.TXT_SUB, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ color: AppColors.TXT_MAIN, mb: 1 }}>
              No Data Found
            </Typography>
            <Typography variant="body2" sx={{ color: AppColors.TXT_SUB }}>
              No records match your current filters.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Mobile Card View */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              {data.map((item, index) => renderMobileCard(item, index))}
            </Box>

            {/* Desktop Table View */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <TableContainer>
                <Table>
                  {renderTableHeaders()}
                  {renderTableBody()}
                </Table>
              </TableContainer>
            </Box>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: AppColors.TXT_MAIN,
                      '&.Mui-selected': {
                        bgcolor: AppColors.GOLD_DARK,
                        color: AppColors.BG_MAIN,
                        '&:hover': {
                          bgcolor: AppColors.GOLD_LIGHT,
                        },
                      },
                      '&:hover': {
                        bgcolor: `${AppColors.GOLD_DARK}20`,
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </DashboardCard>
    </Box>
  );
};

// Reusable Dashboard Card Component
const DashboardCard = ({ title, subtitle, children, sx = {} }) => (
  <Paper
    elevation={0}
    sx={{
      backgroundColor: AppColors.BG_CARD,
      border: `1px solid ${AppColors.BG_SECONDARY}`,
      borderRadius: 3,
      p: { xs: 1, md: 1.5 },
      height: '100%',
      background: `linear-gradient(135deg, ${AppColors.BG_CARD} 0%, ${AppColors.BG_SECONDARY} 100%)`,
      ...sx
    }}
  >
    <Box sx={{ mb: { xs: 1, md: 1.5 } }}>
      <Typography
        variant="h6"
        sx={{
          color: AppColors.TXT_MAIN,
          fontWeight: 600,
          mb: { xs: 0.5, md: 1 },
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="body2"
          sx={{
            color: AppColors.TXT_SUB,
            fontSize: '0.875rem',
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
    {children}
  </Paper>
);

export default ManageHistoryNLogs;

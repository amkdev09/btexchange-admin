import React, { useState, useEffect } from 'react';
import tradeService from '../../../services/tradeService';
import { AppColors } from '../../../constant/appColors';
import BTLoader from '../../../components/Loader';
import './HistoryLogs.scss';

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
    startDate: '',
    endDate: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 480);
  const [exportLoading, setExportLoading] = useState(false);

  const tabs = [
    { id: 'trades', label: 'Trades History', icon: '📈' },
    { id: 'income', label: 'Income History', icon: '💰' },
    { id: 'deposits', label: 'Deposits History', icon: '⬇️' },
    { id: 'withdrawals', label: 'Withdrawals History', icon: '⬆️' }
  ];

  useEffect(() => {
    loadHistoryData();
  }, [activeTab, pagination.page, filters]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 480);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const getStatusBadge = (status) => {
    const statusColors = {
      WIN: AppColors.SUCCESS,
      LOSS: AppColors.ERROR,
      OPEN: AppColors.GOLD_DARK,
      SUCCESS: AppColors.SUCCESS,
      PENDING: AppColors.GOLD_DARK,
      FAILED: AppColors.ERROR,
      COMPLETED: AppColors.SUCCESS,
      PROCESSING: AppColors.GOLD_DARK
    };

    return (
      <span
        className="status-badge"
        style={{
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          backgroundColor: `${statusColors[status] || AppColors.HLT_NONE}20`,
          color: statusColors[status] || AppColors.HLT_NONE,
          border: `1px solid ${statusColors[status] || AppColors.HLT_NONE}40`
        }}
      >
        {status}
      </span>
    );
  };

  const renderMobileCard = (item, index) => {
    const cardData = {
      trades: {
        id: item.userId || 'N/A',
        status: item.status,
        fields: [
          { label: 'Pair', value: item.pair || 'N/A' },
          { label: 'Amount', value: `$${formatAmount(item.amount)}` },
          { label: 'Opened', value: formatDate(item.createdAt) },
          { label: 'Profit/Loss', value: item.profit ? (item.profit > 0 ? '+' : '') + formatAmount(item.profit) : 'N/A' }
        ]
      },
      income: {
        id: item.userId || 'N/A',
        status: 'SUCCESS',
        fields: [
          { label: 'Type', value: item.type || 'N/A' },
          { label: 'Amount', value: `+$${formatAmount(item.amount)}` },
          { label: 'From User', value: item.fromUserId || 'N/A' },
          { label: 'Date', value: formatDate(item.createdAt) }
        ]
      },
      deposits: {
        id: item.userId || 'N/A',
        status: item.status,
        fields: [
          { label: 'Amount', value: `$${formatAmount(item.amount)}` },
          { label: 'Chain', value: item.chain || 'N/A' },
          { label: 'Date', value: formatDate(item.createdAt) },
          { label: 'TX Hash', value: item.txHash ? `${item.txHash.slice(0, 8)}...` : 'N/A' }
        ]
      },
      withdrawals: {
        id: item.userId || 'N/A',
        status: item.status,
        fields: [
          { label: 'Amount', value: `-$${formatAmount(item.amount)}` },
          { label: 'Type', value: item.type || 'N/A' },
          { label: 'Date', value: formatDate(item.createdAt) },
          { label: 'TX Hash', value: item.txHash ? `${item.txHash.slice(0, 8)}...` : 'N/A' }
        ]
      }
    };

    const card = cardData[activeTab];

    return (
      <div key={index} className="card-item">
        <div className="card-header">
          <div className="card-id">ID: {card.id}</div>
          {getStatusBadge(card.status)}
        </div>
        <div className="card-body">
          {card.fields.map((field, idx) => (
            <div key={idx} className="card-field">
              <div className="field-label">{field.label}</div>
              <div 
                className="field-value"
                style={{
                  color: field.label === 'Amount' && field.value.startsWith('+') ? AppColors.SUCCESS :
                         field.label === 'Amount' && field.value.startsWith('-') ? AppColors.ERROR :
                         field.label === 'Profit/Loss' && field.value.startsWith('+') ? AppColors.SUCCESS :
                         field.label === 'Profit/Loss' && field.value.startsWith('-') ? AppColors.ERROR :
                         AppColors.TXT_MAIN
                }}
              >
                {field.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="responsive-filters" style={{
      backgroundColor: AppColors.BG_CARD,
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '20px',
      border: `1px solid ${AppColors.GOLD_DARK}20`
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '16px'
      }}>
        <input
          type="text"
          placeholder="Search by User ID, UID, or Email"
          value={searchTerm}
          onChange={handleSearch}
          className="filter-input"
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: `1px solid ${AppColors.GOLD_DARK}40`,
            backgroundColor: AppColors.BG_SECONDARY,
            color: AppColors.TXT_MAIN,
            fontSize: '14px'
          }}
        />

        {activeTab === 'trades' && (
          <>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${AppColors.GOLD_DARK}40`,
                backgroundColor: AppColors.BG_SECONDARY,
                color: AppColors.TXT_MAIN
              }}
            >
              <option value="">All Status</option>
              <option value="WIN">WIN</option>
              <option value="LOSS">LOSS</option>
              <option value="OPEN">OPEN</option>
            </select>
            <input
              type="text"
              placeholder="Trading Pair (e.g., BTC-USD)"
              value={filters.pair}
              onChange={(e) => handleFilterChange('pair', e.target.value)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${AppColors.GOLD_DARK}40`,
                backgroundColor: AppColors.BG_SECONDARY,
                color: AppColors.TXT_MAIN
              }}
            />
          </>
        )}

        {activeTab === 'income' && (
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: `1px solid ${AppColors.GOLD_DARK}40`,
              backgroundColor: AppColors.BG_SECONDARY,
              color: AppColors.TXT_MAIN
            }}
          >
            <option value="">All Types</option>
            <option value="REFERRAL_BONUS">Referral Bonus</option>
            <option value="LEVEL_INCOME">Level Income</option>
          </select>
        )}

        {(activeTab === 'deposits' || activeTab === 'withdrawals') && (
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: `1px solid ${AppColors.GOLD_DARK}40`,
              backgroundColor: AppColors.BG_SECONDARY,
              color: AppColors.TXT_MAIN
            }}
          >
            <option value="">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        )}

        {activeTab === 'withdrawals' && (
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: `1px solid ${AppColors.GOLD_DARK}40`,
              backgroundColor: AppColors.BG_SECONDARY,
              color: AppColors.TXT_MAIN
            }}
          >
            <option value="">All Types</option>
            <option value="WITHDRAW_WINNINGS">Withdraw Winnings</option>
            <option value="WITHDRAW_WORKING">Withdraw Working</option>
          </select>
        )}

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: `1px solid ${AppColors.GOLD_DARK}40`,
            backgroundColor: AppColors.BG_SECONDARY,
            color: AppColors.TXT_MAIN
          }}
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: `1px solid ${AppColors.GOLD_DARK}40`,
            backgroundColor: AppColors.BG_SECONDARY,
            color: AppColors.TXT_MAIN
          }}
        />
      </div>

      <button
        onClick={clearFilters}
        className="action-button"
        style={{
          padding: '10px 20px',
          borderRadius: '8px',
          border: `1px solid ${AppColors.GOLD_DARK}`,
          backgroundColor: 'transparent',
          color: AppColors.GOLD_DARK,
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = `${AppColors.GOLD_DARK}20`;
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = 'transparent';
        }}
      >
        Clear Filters
      </button>
    </div>
  );

  const renderTradeRow = (item, index) => (
    <tr key={item.id || index} className="table-row" style={{
      backgroundColor: index % 2 === 0 ? AppColors.BG_CARD : AppColors.BG_SECONDARY,
      borderBottom: `1px solid ${AppColors.GOLD_DARK}10`
    }}>
      <td style={cellStyle}>{item.userId || 'N/A'}</td>
      <td style={cellStyle}>{item.pair || 'N/A'}</td>
      <td style={cellStyle}>${formatAmount(item.amount)}</td>
      <td style={cellStyle}>{getStatusBadge(item.status)}</td>
      <td style={cellStyle}>{formatDate(item.createdAt)}</td>
      <td style={cellStyle}>{formatDate(item.closedAt)}</td>
      <td style={cellStyle}>
        <span style={{ color: item.status === 'WIN' ? AppColors.SUCCESS : AppColors.ERROR }}>
          {item.profit ? (item.profit > 0 ? '+' : '') + formatAmount(item.profit) : 'N/A'}
        </span>
      </td>
    </tr>
  );

  const renderIncomeRow = (item, index) => (
    <tr key={item.id || index} className="table-row" style={{
      backgroundColor: index % 2 === 0 ? AppColors.BG_CARD : AppColors.BG_SECONDARY,
      borderBottom: `1px solid ${AppColors.GOLD_DARK}10`
    }}>
      <td style={cellStyle}>{item.userId || 'N/A'}</td>
      <td style={cellStyle}>{item.type || 'N/A'}</td>
      <td style={cellStyle}>
        <span style={{ color: AppColors.SUCCESS }}>
          +${formatAmount(item.amount)}
        </span>
      </td>
      <td style={cellStyle}>{item.fromUserId || 'N/A'}</td>
      <td style={cellStyle}>{formatDate(item.createdAt)}</td>
      <td style={cellStyle}>{item.description || 'N/A'}</td>
    </tr>
  );

  const renderDepositRow = (item, index) => (
    <tr key={item.id || index} className="table-row" style={{
      backgroundColor: index % 2 === 0 ? AppColors.BG_CARD : AppColors.BG_SECONDARY,
      borderBottom: `1px solid ${AppColors.GOLD_DARK}10`
    }}>
      <td style={cellStyle}>{item.userId || 'N/A'}</td>
      <td style={cellStyle}>${formatAmount(item.amount)}</td>
      <td style={cellStyle}>{item.chain || 'N/A'}</td>
      <td style={cellStyle}>
        <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          {item.address ? `${item.address.slice(0, 8)}...${item.address.slice(-6)}` : 'N/A'}
        </span>
      </td>
      <td style={cellStyle}>{getStatusBadge(item.status)}</td>
      <td style={cellStyle}>{formatDate(item.createdAt)}</td>
      <td style={cellStyle}>
        {item.txHash ? (
          <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
            {`${item.txHash.slice(0, 8)}...${item.txHash.slice(-6)}`}
          </span>
        ) : 'N/A'}
      </td>
    </tr>
  );

  const renderWithdrawalRow = (item, index) => (
    <tr key={item.id || index} className="table-row" style={{
      backgroundColor: index % 2 === 0 ? AppColors.BG_CARD : AppColors.BG_SECONDARY,
      borderBottom: `1px solid ${AppColors.GOLD_DARK}10`
    }}>
      <td style={cellStyle}>{item.userId || 'N/A'}</td>
      <td style={cellStyle}>
        <span style={{ color: AppColors.ERROR }}>
          -${formatAmount(item.amount)}
        </span>
      </td>
      <td style={cellStyle}>{item.type || 'N/A'}</td>
      <td style={cellStyle}>
        <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          {item.toAddress ? `${item.toAddress.slice(0, 8)}...${item.toAddress.slice(-6)}` : 'N/A'}
        </span>
      </td>
      <td style={cellStyle}>{getStatusBadge(item.status)}</td>
      <td style={cellStyle}>{formatDate(item.createdAt)}</td>
      <td style={cellStyle}>
        {item.txHash ? (
          <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
            {`${item.txHash.slice(0, 8)}...${item.txHash.slice(-6)}`}
          </span>
        ) : 'N/A'}
      </td>
    </tr>
  );

  const renderTableHeaders = () => {
    const headers = {
      trades: ['User ID', 'Pair', 'Amount', 'Status', 'Opened', 'Closed', 'Profit/Loss'],
      income: ['User ID', 'Type', 'Amount', 'From User', 'Date', 'Description'],
      deposits: ['User ID', 'Amount', 'Chain', 'Address', 'Status', 'Date', 'TX Hash'],
      withdrawals: ['User ID', 'Amount', 'Type', 'To Address', 'Status', 'Date', 'TX Hash']
    };

    return (
      <thead>
        <tr style={{ backgroundColor: `${AppColors.GOLD_DARK}20` }}>
          {headers[activeTab]?.map((header, index) => (
            <th key={index} style={{
              ...headerStyle,
              color: AppColors.GOLD_DARK,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
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
      <tbody>
        {data.map((item, index) => renderFunction(item, index))}
      </tbody>
    );
  };

  const renderPagination = () => (
    <div className="responsive-pagination" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '20px',
      padding: '16px',
      backgroundColor: AppColors.BG_CARD,
      borderRadius: '12px',
      border: `1px solid ${AppColors.GOLD_DARK}20`
    }}>
      <div style={{ color: AppColors.TXT_SUB, fontSize: '14px' }}>
        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
          disabled={pagination.page <= 1}
          style={{
            ...paginationButtonStyle,
            opacity: pagination.page <= 1 ? 0.5 : 1,
            cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer'
          }}
        >
          Previous
        </button>

        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
          const page = Math.max(1, pagination.page - 2) + i;
          if (page > pagination.totalPages) return null;
          
          return (
            <button
              key={page}
              onClick={() => setPagination(prev => ({ ...prev, page }))}
              style={{
                ...paginationButtonStyle,
                backgroundColor: page === pagination.page ? AppColors.GOLD_DARK : 'transparent',
                color: page === pagination.page ? AppColors.BG_MAIN : AppColors.GOLD_DARK
              }}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
          disabled={pagination.page >= pagination.totalPages}
          style={{
            ...paginationButtonStyle,
            opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
            cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer'
          }}
        >
          Next
        </button>
      </div>
    </div>
  );

  const containerStyle = {
    padding: '24px',
    minHeight: '100vh',
    backgroundColor: AppColors.BG_MAIN
  };

  const headerStyle = {
    padding: '12px 16px',
    textAlign: 'left',
    borderBottom: `2px solid ${AppColors.GOLD_DARK}`,
    color: AppColors.TXT_MAIN,
    fontSize: '14px'
  };

  const cellStyle = {
    padding: '12px 16px',
    color: AppColors.TXT_MAIN,
    fontSize: '14px',
    borderBottom: `1px solid ${AppColors.GOLD_DARK}10`
  };

  const paginationButtonStyle = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: `1px solid ${AppColors.GOLD_DARK}`,
    backgroundColor: 'transparent',
    color: AppColors.GOLD_DARK,
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  };

  return (
    <div className="history-logs-container" style={containerStyle}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      {/* Header */}
      <div className="responsive-stats" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{ 
            color: AppColors.TXT_MAIN, 
            marginBottom: '8px',
            background: `linear-gradient(45deg, ${AppColors.GOLD_DARK}, ${AppColors.GOLD_LIGHT})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            History & Logs Management
          </h1>
          <p style={{ color: AppColors.TXT_SUB, margin: '0' }}>
            Monitor and analyze all platform activities
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={exportData}
            disabled={exportLoading || data.length === 0}
            className="export-button"
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: AppColors.GOLD_DARK,
              color: AppColors.BG_MAIN,
              cursor: exportLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: exportLoading || data.length === 0 ? 0.6 : 1,
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {exportLoading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: `2px solid ${AppColors.BG_MAIN}`,
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Exporting...
              </>
            ) : (
              <>
                📄 Export CSV
              </>
            )}
          </button>

          <div style={{
            padding: '16px',
            backgroundColor: AppColors.BG_CARD,
            borderRadius: '12px',
            border: `1px solid ${AppColors.GOLD_DARK}20`,
            textAlign: 'center'
          }}>
            <div style={{ color: AppColors.GOLD_DARK, fontSize: '24px', fontWeight: '600' }}>
              {pagination.total}
            </div>
            <div style={{ color: AppColors.TXT_SUB, fontSize: '12px' }}>
              Total Records
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="responsive-tabs" style={{
        display: 'flex',
        gap: '2px',
        marginBottom: '24px',
        backgroundColor: AppColors.BG_CARD,
        padding: '8px',
        borderRadius: '12px',
        border: `1px solid ${AppColors.GOLD_DARK}20`,
        flexWrap: 'wrap'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === tab.id ? AppColors.GOLD_DARK : 'transparent',
              color: activeTab === tab.id ? AppColors.BG_MAIN : AppColors.TXT_MAIN,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              if (activeTab !== tab.id) {
                e.target.style.backgroundColor = `${AppColors.GOLD_DARK}20`;
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== tab.id) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '16px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      {renderFilters()}

      {/* Data Display */}
      <div className={isMobileView ? 'mobile-card-view' : ''} style={{
        backgroundColor: AppColors.BG_CARD,
        borderRadius: '12px',
        overflow: 'hidden',
        border: `1px solid ${AppColors.GOLD_DARK}20`,
        boxShadow: `0 4px 20px ${AppColors.GOLD_DARK}10`
      }}>
        {loading ? (
          <div className="loading-container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '60px',
            color: AppColors.GOLD_DARK
          }}>
            <BTLoader />
          </div>
        ) : data.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: AppColors.TXT_SUB
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ color: AppColors.TXT_MAIN, marginBottom: '8px' }}>No Data Found</h3>
            <p>No records match your current filters.</p>
          </div>
        ) : isMobileView ? (
          // Mobile Card View
          <div style={{ padding: '16px' }}>
            {data.map((item, index) => renderMobileCard(item, index))}
          </div>
        ) : (
          // Desktop Table View
          <div className="table-container table-scroll-container" style={{ overflowX: 'auto' }}>
            <table className="responsive-table" style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '800px'
            }}>
              {renderTableHeaders()}
              {renderTableBody()}
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data.length > 0 && renderPagination()}
    </div>
  );
};

export default ManageHistoryNLogs;
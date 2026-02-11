import React, { useEffect, useState } from 'react';
import { Search, Eye, MessageCircle, Clock, User, Tag, LifeBuoy, FileWarning, Sparkles } from 'lucide-react';
import Pagination from '../../../components/ui/pagination';
import { getAllTickets } from '../../../services/ServicesAdmin/TicketService';
import { useNavigate } from 'react-router-dom';
import NotifyError from '../../../components/ui/NotifyError';
import Loading from '../../../components/ui/loading';

const AllTickets = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [data, setData] = useState([]); // This should be fetched from your API
  const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [nbrTicketPerPage, setNbrTicketPerPage] = useState(10);
    const navigate = useNavigate();
    
// get tickets
useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const response = await getAllTickets(searchTerm, sortBy,selectedFilter, currentPage, nbrTicketPerPage, setError);
        if (!response?.tickets) {
          throw new Error("Failed to load tickets.");
        }
        setData(response);
        setCurrentPage(response.tickets.current_page);
        setNbrTicketPerPage(response.tickets.per_page);
      } catch (error) {
        setError(error?.message || "Failed to load tickets.");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [searchTerm, sortBy, selectedFilter, currentPage, nbrTicketPerPage]);


  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800 border-blue-200',
      'assigned': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'in_progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'pending': 'bg-orange-100 text-orange-800 border-orange-200',
      'resolved': 'bg-green-100 text-green-800 border-green-200',
      'closed': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-green-50 text-green-700 border-green-200',
      'medium': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'high': 'bg-orange-50 text-orange-700 border-orange-200',
      'critical': 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[priority] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'support': <LifeBuoy className="w-5 h-5 text-blue-500" />,
      'report': <FileWarning className="w-5 h-5 text-red-500" />,
      'feature_request': <Sparkles className="w-5 h-5 text-yellow-500" />
    };
    return icons[type] || <Tag className="w-5 h-5 text-gray-400" />;
  };

  const getTypeLabel = (type) => {
    const labels = {
      'support': 'Support',
      'report': 'Report',
      'feature_request': 'Feature Request'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status) => {
    const labels = {
      'new': 'New',
      'assigned': 'Assigned',
      'in_progress': 'In Progress',
      'pending': 'Pending',
      'resolved': 'Resolved',
      'closed': 'Closed'
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'critical': 'Critical'
    };
    return labels[priority] || priority;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US');
  };

  return (
    loading  ? <Loading/> :<div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ticket Management</h1>
          <p className="text-gray-600">View and manage all support tickets and reports</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{data?.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {data?.in_progress}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New</p>
                <p className="text-2xl font-bold text-blue-600">
                  {data?.new}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {data?.resolved}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">By Priority</option>
                <option value="status">By Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4 bg-white relative">
          {data?.tickets?.data?.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">No data</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-500">No tickets match your search criteria</p>
            </div>
          ) : (
            data?.tickets?.data?.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* Ticket Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getTypeIcon(ticket?.type)}</span>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                          {ticket?.title}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="font-medium">#{ticket?.ticket_number}</span>
                        <span>•</span>
                        <span>{formatDate(ticket.created_at)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {ticket?.user?.name || 'Unknown'}
                        </span>
                      </div>

                      <p className="text-gray-600 line-clamp-2 mb-4">
                        {ticket?.description}
                      </p>

                      {/* Tags */}
                      {/* <div className="flex flex-wrap gap-2 mb-4">
                        {ticket.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div> */}
                    </div>

                    {/* Action Menu */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate(`/admin/detaill-ticket/${ticket.id}`)}className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Status and Priority Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Type */}
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
                        {getTypeLabel(ticket.type)}
                      </span>

                      {/* Status */}
                      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </span>

                      {/* Priority */}
                      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(ticket.priority)}`}>
                        {getPriorityLabel(ticket.priority)} Priority
                      </span>
                    </div>

                    {/* Assigned To */}
                    {ticket.assigned_user ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Assigned to:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-800">
                            {(ticket.assigned_user?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{ticket.assigned_user?.name}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Unassigned</div>
                    )}
                  </div>
                </div>

                {/* Quick Actions Bar */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Last updated: {ticket.updated_at ? formatDate(ticket.updated_at) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {/* pagination */}
  <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage}   />
        </div>
      </div>
        <NotifyError message={error} onClose={()=>setError(null)}   isVisible={error !== null && true}/>
    </div>
  );
};

export default AllTickets;

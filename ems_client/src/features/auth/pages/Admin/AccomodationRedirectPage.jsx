import React, { useCallback, useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BedDouble,
  ArrowLeft,
  ArrowRight,
  Users,
  Clock,
  Mars,
  Venus,
  Search,
  Eye,
  Edit2,
  Plus,
  X,
  MapPin,
  CalendarDays,
  Save,
  Trash2,
  UserPlus,
  CheckCircle,
  Building2,
  Layers,
  Utensils,
  ShieldAlert,
  UserMinus,
  RefreshCw,
  CreditCard,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  IndianRupee,
  ExternalLink,
  Check,
} from 'lucide-react';

function AccomodationRedirectPage() {
  const navigate = useNavigate();
  const { eventId: routeEventId } = useParams();
  const [searchParams] = useSearchParams();
  const eventId = routeEventId || searchParams.get('eventId') || (() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || 'null')?.EventId || '';
    } catch {
      return '';
    }
  })();

  // Core Data
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' | 'blocks' | 'requests'
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [requestedStudents, setRequestedStudents] = useState([]);
  const [event, setEvent] = useState(null);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all'); // 'all' | 'Boys' | 'Girls'
  const [selectedBlockFilter, setSelectedBlockFilter] = useState('all');

  // Block Modal Form
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [blockSaving, setBlockSaving] = useState(false);
  const [blockError, setBlockError] = useState('');
  const [blockForm, setBlockForm] = useState({
    BlockName: '',
    Gender: 'Boys',
    Description: '',
  });

  // Room Modal Form
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [roomSaving, setRoomSaving] = useState(false);
  const [roomError, setRoomError] = useState('');
  const [roomForm, setRoomForm] = useState({
    BlockId: '',
    roomNumber: '',
    roomType: 'Standard 4-Bed',
    capacity: '4',
    gender: 'Boys',
    status: 'Available',
  });

  // Room Details / Inspection Modal
  const [inspectingRoom, setInspectingRoom] = useState(null);
  const [deallocatingUserId, setDeallocatingUserId] = useState(null);

  // Allocation Modal & State (Room to Multiple Students)
  const [allocatingRoom, setAllocatingRoom] = useState(null);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [allocating, setAllocating] = useState(false);
  const [allocationError, setAllocationError] = useState('');

  // Single Student Room Assignment Modal & Filter State (Direct from Requests)
  const [assigningStudent, setAssigningStudent] = useState(null);
  const [targetRoomId, setTargetRoomId] = useState('');
  const [isAssigningRoom, setIsAssigningRoom] = useState(false);
  const [assignRoomError, setAssignRoomError] = useState('');
  const [requestSearch, setRequestSearch] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState('all'); // 'all' | 'awaiting' | 'allocated'
  const [requestGenderFilter, setRequestGenderFilter] = useState('all'); // 'all' | 'male' | 'female'

  // Facility Bookings & Payments State
  const [facilityBookings, setFacilityBookings] = useState([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all'); // 'all' | 'Pending' | 'Approved' | 'Rejected'
  const [actionModalBooking, setActionModalBooking] = useState(null); // { booking, newStatus, remarks }
  const [updatingBookingStatus, setUpdatingBookingStatus] = useState(false);
  const [adminProofModalUrl, setAdminProofModalUrl] = useState(null);

  // Helper Getters
  const getRoomId = (room) => room.Id ?? room.id;
  const getRoomNumber = (room) => room.room_num ?? 'N/A';
  const getCapacity = (room) => Number(room.Capacity ?? room.capacity ?? 0);
  const getOccupiedCount = (room) => {
    if (room.Occupied != null) return Number(room.Occupied);
    if (Array.isArray(room.participants)) return room.participants.length;
    return 0;
  };
  const getRoomGender = (room) => String(room.BlockGender || room.Gender || room.gender || '').trim();
  const isBoysRoom = (room) => ['boys', 'boy', 'male', 'm'].includes(getRoomGender(room).toLowerCase());
  const isGirlsRoom = (room) => ['girls', 'girl', 'female', 'f'].includes(getRoomGender(room).toLowerCase());

  const getRoomStatus = (room) => {
    const capacity = getCapacity(room);
    const occupied = getOccupiedCount(room);
    const storedStatus = room.Status ?? room.status;
    if (storedStatus === 'Maintenance') return 'Maintenance';
    if (capacity > 0 && occupied >= capacity) return 'Fully Occupied';
    if (occupied > 0) return 'Partially Filled';
    return 'Available';
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Time not recorded';
    const parsed = new Date(timestamp);
    if (Number.isNaN(parsed.getTime())) return String(timestamp);
    return parsed.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return String(date);
    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Fetch all Accommodation Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [blocksRes, roomsRes, eventRes, requestsRes, bookingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/accommodation/blocks${eventId ? `?eventId=${encodeURIComponent(eventId)}` : ''}`),
        fetch(`${API_BASE_URL}/api/accommodation${eventId ? `?eventId=${encodeURIComponent(eventId)}` : ''}`),
        eventId ? fetch(`${API_BASE_URL}/api/events/${encodeURIComponent(eventId)}`) : Promise.resolve(null),
        eventId ? fetch(`${API_BASE_URL}/api/physical-services/events/${encodeURIComponent(eventId)}/accommodation-participants`) : Promise.resolve(null),
        eventId ? fetch(`${API_BASE_URL}/api/physical-services/events/${encodeURIComponent(eventId)}/facility-bookings`) : Promise.resolve(null),
      ]);

      const [blocksData, roomsData] = await Promise.all([
        blocksRes.json().catch(() => ({})),
        roomsRes.json().catch(() => ({})),
      ]);

      if (blocksRes.ok && Array.isArray(blocksData.data)) {
        setBlocks(blocksData.data);
      }
      if (roomsRes.ok && Array.isArray(roomsData.data)) {
        setRooms(roomsData.data);
      }

      if (eventRes && eventRes.ok) {
        const evData = await eventRes.json().catch(() => ({}));
        setEvent(evData.event || evData.data || evData);
      }

      if (requestsRes && requestsRes.ok) {
        const reqData = await requestsRes.json().catch(() => ({}));
        setRequestedStudents(Array.isArray(reqData.participants) ? reqData.participants : []);
      }

      if (bookingsRes && bookingsRes.ok) {
        const bData = await bookingsRes.json().catch(() => ({}));
        setFacilityBookings(Array.isArray(bData.bookings) ? bData.bookings : []);
      }
    } catch (err) {
      console.error('Fetch accommodation error:', err);
      setError(err.message || 'Failed to load accommodation data.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const handleUpdateBookingStatus = async (teamId, status, remarks = '') => {
    if (!eventId || !teamId) return;
    setUpdatingBookingStatus(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/physical-services/events/${encodeURIComponent(eventId)}/teams/${encodeURIComponent(teamId)}/booking-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingStatus: status, adminRemarks: remarks })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update booking status');
      setSuccessMessage(`Booking for Team #${teamId} marked as ${status}!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchData();
      setActionModalBooking(null);
    } catch (err) {
      setError(err.message || 'Failed to update booking status');
    } finally {
      setUpdatingBookingStatus(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Block Handlers
  const openAddBlockModal = () => {
    setEditingBlockId(null);
    setBlockForm({
      BlockName: '',
      Gender: 'Boys',
      Description: '',
    });
    setBlockError('');
    setShowBlockModal(true);
  };

  const openEditBlockModal = (block) => {
    setEditingBlockId(block.Id);
    setBlockForm({
      BlockName: block.BlockName,
      Gender: block.Gender,
      Description: block.Description || '',
    });
    setBlockError('');
    setShowBlockModal(true);
  };

  const handleSaveBlock = async (e) => {
    e.preventDefault();
    if (!blockForm.BlockName.trim()) {
      setBlockError('Please provide a block name (e.g. Cauvery Boys Hostel).');
      return;
    }
    setBlockSaving(true);
    setBlockError('');
    try {
      const url = editingBlockId
        ? `${API_BASE_URL}/api/accommodation/blocks/${editingBlockId}`
        : `${API_BASE_URL}/api/accommodation/blocks`;
      const method = editingBlockId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          EventId: eventId ? Number(eventId) : null,
          BlockName: blockForm.BlockName.trim(),
          Gender: blockForm.Gender,
          Description: blockForm.Description.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save hostel block.');
      }

      setSuccessMessage(editingBlockId ? 'Block updated successfully.' : 'New block created successfully.');
      setShowBlockModal(false);
      await fetchData();
    } catch (err) {
      setBlockError(err.message || 'Failed to save block.');
    } finally {
      setBlockSaving(false);
    }
  };

  const handleDeleteBlock = async (block) => {
    if (!window.confirm(`Are you sure you want to delete "${block.BlockName}"? This will delete all rooms inside this block.`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/accommodation/blocks/${block.Id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete block.');
      }
      setSuccessMessage('Hostel block deleted successfully.');
      await fetchData();
    } catch (err) {
      alert(err.message || 'Could not delete block.');
    }
  };

  // Room Handlers
  const openAddRoomModal = (defaultBlockId = null) => {
    if (blocks.length === 0) {
      alert('Please create at least one Hostel Block (Boys or Girls) first before adding rooms.');
      setActiveTab('blocks');
      openAddBlockModal();
      return;
    }

    const selectedBlock = defaultBlockId
      ? blocks.find((b) => String(b.Id) === String(defaultBlockId)) || blocks[0]
      : blocks[0];

    setEditingRoomId(null);
    setRoomForm({
      BlockId: String(selectedBlock.Id),
      roomNumber: '',
      roomType: 'Standard 4-Bed',
      capacity: '4',
      gender: selectedBlock.Gender,
      status: 'Available',
    });
    setRoomError('');
    setShowRoomModal(true);
  };

  const openEditRoomModal = (room) => {
    setEditingRoomId(room.Id);
    setRoomForm({
      BlockId: room.BlockId ? String(room.BlockId) : '',
      roomNumber: room.room_num || '',
      roomType: room.Type || 'Standard',
      capacity: String(room.Capacity || '4'),
      gender: room.Gender || 'Boys',
      status: room.Status || 'Available',
    });
    setRoomError('');
    setShowRoomModal(true);
  };

  const handleRoomBlockChange = (e) => {
    const chosenBlockId = e.target.value;
    const chosenBlock = blocks.find((b) => String(b.Id) === String(chosenBlockId));
    setRoomForm((prev) => ({
      ...prev,
      BlockId: chosenBlockId,
      gender: chosenBlock ? chosenBlock.Gender : prev.gender,
    }));
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    if (!roomForm.roomNumber.trim()) {
      setRoomError('Room number is required.');
      return;
    }
    const cap = Number(roomForm.capacity);
    if (!cap || cap < 1) {
      setRoomError('Capacity must be at least 1.');
      return;
    }

    setRoomSaving(true);
    setRoomError('');
    try {
      const url = editingRoomId
        ? `${API_BASE_URL}/api/accommodation/${editingRoomId}`
        : `${API_BASE_URL}/api/accommodation`;
      const method = editingRoomId ? 'PUT' : 'POST';

      const existingRoom = editingRoomId ? rooms.find((r) => r.Id === editingRoomId) : null;
      const occupied = existingRoom ? getOccupiedCount(existingRoom) : 0;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          EventId: eventId ? Number(eventId) : null,
          BlockId: roomForm.BlockId ? Number(roomForm.BlockId) : null,
          room_num: roomForm.roomNumber.trim(),
          Type: roomForm.roomType.trim(),
          Gender: roomForm.gender,
          Capacity: cap,
          Occupied: occupied,
          Status: roomForm.status,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save room.');
      }

      setSuccessMessage(editingRoomId ? 'Room updated successfully.' : 'Room created successfully.');
      setShowRoomModal(false);
      await fetchData();
    } catch (err) {
      setRoomError(err.message || 'Failed to save room.');
    } finally {
      setRoomSaving(false);
    }
  };

  const handleDeleteRoom = async (room) => {
    if (getOccupiedCount(room) > 0) {
      alert('This room has active student allocations. Please deallocate all students before deleting.');
      return;
    }
    if (!window.confirm(`Delete room "${room.room_num}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/accommodation/${room.Id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete room.');
      }
      setSuccessMessage('Room deleted successfully.');
      if (inspectingRoom?.Id === room.Id) setInspectingRoom(null);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete room.');
    }
  };

  // Inspect Room Details (Who & When)
  const openInspectRoom = (room) => {
    setInspectingRoom(room);
  };

  // Deallocate Student from Room
  const handleDeallocateStudent = async (roomId, userId, studentName) => {
    if (!window.confirm(`Remove ${studentName || 'this participant'} from this room?`)) return;

    try {
      setDeallocatingUserId(userId);
      const res = await fetch(`${API_BASE_URL}/api/accommodation/${roomId}/allocate/${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to deallocate student.');
      }

      setSuccessMessage(`${studentName} removed from room.`);
      await fetchData();

      // Refresh inspected room
      const refreshedRooms = await fetch(`${API_BASE_URL}/api/accommodation${eventId ? `?eventId=${encodeURIComponent(eventId)}` : ''}`).then((r) => r.json());
      if (Array.isArray(refreshedRooms.data)) {
        const updated = refreshedRooms.data.find((r) => r.Id === roomId);
        if (updated) setInspectingRoom(updated);
      }
    } catch (err) {
      alert(err.message || 'Failed to deallocate student.');
    } finally {
      setDeallocatingUserId(null);
    }
  };

  // Student Allocation Flow (Strict Gender Enforcement)
  const openAllocateModal = (room) => {
    const isBoys = isBoysRoom(room);
    const isGirls = isGirlsRoom(room);

    // Filter requested students:
    // 1. Must NOT already be allocated to any room
    // 2. MUST match the room's gender (Male for Boys block, Female for Girls block)
    const alreadyAllocatedUserIds = new Set();
    rooms.forEach((r) => {
      (r.participants || []).forEach((p) => alreadyAllocatedUserIds.add(String(p.UserId)));
    });

    const eligible = requestedStudents.filter((student) => {
      const uId = String(student.UserId);
      if (alreadyAllocatedUserIds.has(uId)) return false;

      const sGender = String(student.Gender || '').toLowerCase().trim();
      const isStudentMale = ['male', 'boy', 'boys', 'm'].includes(sGender);
      const isStudentFemale = ['female', 'girl', 'girls', 'f'].includes(sGender);

      if (isBoys) return isStudentMale;
      if (isGirls) return isStudentFemale;
      return true;
    });

    setAllocatingRoom(room);
    setEligibleStudents(eligible);
    setSelectedStudents([]);
    setStudentSearch('');
    setAllocationError('');
  };

  const toggleStudentSelection = (student) => {
    const uId = String(student.UserId);
    const capacityLeft = Math.max(0, getCapacity(allocatingRoom) - getOccupiedCount(allocatingRoom));

    setSelectedStudents((current) => {
      if (current.includes(uId)) {
        return current.filter((id) => id !== uId);
      }
      if (current.length >= capacityLeft) {
        setAllocationError(`Only ${capacityLeft} bed(s) available in this room.`);
        return current;
      }
      setAllocationError('');
      return [...current, uId];
    });
  };

  const handleSaveAllocation = async () => {
    if (!allocatingRoom || selectedStudents.length === 0) {
      setAllocationError('Please select at least one student.');
      return;
    }

    setAllocating(true);
    setAllocationError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/accommodation/${allocatingRoom.Id}/allocate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: Number(eventId),
          studentIds: selectedStudents.map(Number),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to allocate students.');
      }

      setSuccessMessage('Students successfully allocated to room.');
      setAllocatingRoom(null);
      await fetchData();

      // If we were inspecting, refresh inspected room
      if (inspectingRoom?.Id === allocatingRoom.Id) {
        const refreshedRooms = await fetch(`${API_BASE_URL}/api/accommodation${eventId ? `?eventId=${encodeURIComponent(eventId)}` : ''}`).then((r) => r.json());
        if (Array.isArray(refreshedRooms.data)) {
          const updated = refreshedRooms.data.find((r) => r.Id === allocatingRoom.Id);
          if (updated) setInspectingRoom(updated);
        }
      }
    } catch (err) {
      setAllocationError(err.message || 'Failed to allocate students.');
    } finally {
      setAllocating(false);
    }
  };

  // Direct Student Room Assignment Handlers (From Requests Tab)
  const openAssignStudentModal = (student) => {
    setAssigningStudent(student);
    setTargetRoomId(student.AccommodationId ? String(student.AccommodationId) : '');
    setAssignRoomError('');
  };

  const handleConfirmSingleStudentAssignment = async (e) => {
    e.preventDefault();
    if (!targetRoomId) {
      setAssignRoomError('Please choose an available room.');
      return;
    }
    if (!assigningStudent) return;

    setIsAssigningRoom(true);
    setAssignRoomError('');
    try {
      // If student is already allocated to another room and is switching, deallocate first
      if (assigningStudent.AccommodationId && String(assigningStudent.AccommodationId) !== String(targetRoomId)) {
        await fetch(`${API_BASE_URL}/api/accommodation/${assigningStudent.AccommodationId}/allocate/${assigningStudent.UserId}`, {
          method: 'DELETE',
        });
      }

      const res = await fetch(`${API_BASE_URL}/api/accommodation/${targetRoomId}/allocate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: Number(eventId),
          studentIds: [assigningStudent.UserId],
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to assign room.');
      }

      setSuccessMessage(`Assigned ${assigningStudent.ParticipantName} to room successfully.`);
      setAssigningStudent(null);
      await fetchData();
    } catch (err) {
      setAssignRoomError(err.message || 'Failed to assign room.');
    } finally {
      setIsAssigningRoom(false);
    }
  };

  // Filtered Rooms Computation
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = [
      room.room_num,
      room.Type,
      room.BlockName,
      ...(room.participants || []).map((p) => p.UserName),
    ]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase().trim());

    const matchesGender =
      genderFilter === 'all'
        ? true
        : genderFilter === 'Boys'
        ? isBoysRoom(room)
        : isGirlsRoom(room);

    const matchesBlock =
      selectedBlockFilter === 'all'
        ? true
        : String(room.BlockId) === String(selectedBlockFilter);

    return matchesSearch && matchesGender && matchesBlock;
  });

  const totalCapacity = rooms.reduce((sum, r) => sum + getCapacity(r), 0);
  const totalOccupied = rooms.reduce((sum, r) => sum + getOccupiedCount(r), 0);
  const totalAvailableBeds = Math.max(0, totalCapacity - totalOccupied);

  return (
    <main className="min-h-screen w-full bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">

        {/* Back Link & Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/admin/physical-event')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Physical Event Hub</span>
          </button>

        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button type="button" onClick={fetchData} className="font-bold underline cursor-pointer">
              Retry
            </button>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>{successMessage}</span>
            </div>
            <button type="button" onClick={() => setSuccessMessage('')}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Banner */}
        <section className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <BedDouble className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Hostel &amp; Accommodation Management
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                  Manage Boys &amp; Girls hostel blocks, configure rooms, and enforce gender-segregated allocations.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500 dark:text-zinc-400">
              <span className="font-bold text-slate-800 dark:text-zinc-200">
                {event?.EventName || 'Physical Hackathon Hub'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                {event?.Location || 'Campus Venue'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-emerald-500" />
                {event?.PhysicalStartDate ? formatDate(event.PhysicalStartDate) : 'Live Schedule'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openAddBlockModal}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-2 border border-slate-200 dark:border-zinc-800 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-500" />
              <span>Add Hostel Block</span>
            </button>
            <button
              type="button"
              onClick={() => openAddRoomModal()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Room</span>
            </button>
          </div>
        </section>

        {/* Global Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
              <span>Hostel Blocks</span>
              <Building2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">
              {blocks.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {blocks.filter((b) => b.Gender === 'Boys').length} Boys • {blocks.filter((b) => b.Gender === 'Girls').length} Girls
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
              <span>Configured Rooms</span>
              <BedDouble className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">
              {rooms.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {rooms.filter(isBoysRoom).length} Boys rooms • {rooms.filter(isGirlsRoom).length} Girls rooms
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
              <span>Bed Occupancy</span>
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold mt-2 text-emerald-600 dark:text-emerald-400">
              {totalOccupied} <span className="text-sm font-normal text-slate-400">/ {totalCapacity} beds</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {totalAvailableBeds} beds available
            </p>
          </div>

          <div
            onClick={() => setActiveTab('requests')}
            className={`p-5 rounded-2xl border bg-white dark:bg-black shadow-sm cursor-pointer transition group ${
              activeTab === 'requests'
                ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40'
            }`}
            title="Click to view and manage participant accommodation requests"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
              <span className="group-hover:text-emerald-500 transition-colors font-bold">Food &amp; Stay Requests</span>
              <Utensils className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">
              {requestedStudents.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="text-emerald-500 font-semibold">{requestedStudents.filter((s) => s.AccommodationAllocated).length} allocated</span>
              <span>•</span>
              <span className={`font-semibold ${requestedStudents.filter((s) => !s.AccommodationAllocated).length > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                {requestedStudents.filter((s) => !s.AccommodationAllocated).length} awaiting room
              </span>
            </p>
          </div>
        </section>

        {/* Seamless Navigation Tabs */}
        <div className="relative pt-2">
          <div className="flex items-end gap-2 px-2 sm:px-4 relative z-10 -mb-px overflow-x-auto">
            {[
              { id: 'rooms', label: 'Rooms Directory', count: rooms.length, icon: BedDouble },
              { id: 'blocks', label: 'Hostel Blocks', count: blocks.length, icon: Building2 },
              {
                id: 'requests',
                label: 'Food & Accommodation Requests',
                count: requestedStudents.length,
                pendingCount: requestedStudents.filter((s) => !s.AccommodationAllocated).length,
                icon: Utensils,
              },
              {
                id: 'bookings',
                label: 'Facility Bookings & Payments',
                count: facilityBookings.length,
                pendingCount: facilityBookings.filter((b) => b.BookingStatus === 'Pending').length,
                icon: CreditCard,
              },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const TabIcon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="relative h-12 px-5 sm:px-7 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2.5 transition-colors duration-200 outline-none cursor-pointer shrink-0"
                >
                  {isActive ? (
                    <motion.div
                      layoutId="accFolderTabActivePill"
                      className="absolute inset-0 rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-slate-200 dark:border-zinc-800 z-10 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    >
                      <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-20" />
                    </motion.div>
                  ) : (
                    <div className="absolute inset-0 rounded-t-2xl bg-slate-100 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 z-0" />
                  )}

                  <span className={`relative z-20 flex items-center gap-2 transition-colors ${
                    isActive
                      ? 'text-slate-900 dark:text-white font-bold'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}>
                    <TabIcon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                    <span
                      className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-200/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                    {tab.pendingCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        {tab.pendingCount} Pending
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Tab Content Card */}
          <div className="bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 space-y-6 relative z-0">

            {/* TAB 1: ROOMS DIRECTORY */}
            {activeTab === 'rooms' && (
              <div className="space-y-6">
                {/* Pending Allocation Alert Banner */}
                {requestedStudents.filter((s) => !s.AccommodationAllocated).length > 0 && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-amber-100 text-sm">
                          {requestedStudents.filter((s) => !s.AccommodationAllocated).length} Participant(s) Awaiting Room Allocation
                        </p>
                        <p className="text-[11px] text-amber-300/80 mt-0.5">
                          Physical teams have requested accommodation. Allocate them directly into rooms below or manage all student requests.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('requests')}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs inline-flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-sm"
                    >
                      <span>Manage &amp; Assign Requests</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search room number, type, block, student..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Gender Filter */}
                    <div className="flex items-center rounded-xl bg-slate-100 dark:bg-zinc-900 p-1 border border-slate-200 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setGenderFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${genderFilter === 'all' ? 'bg-white dark:bg-black text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400'}`}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setGenderFilter('Boys')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${genderFilter === 'Boys' ? 'bg-white dark:bg-black text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-zinc-400'}`}
                      >
                        <Mars className="w-3 h-3" /> Boys
                      </button>
                      <button
                        type="button"
                        onClick={() => setGenderFilter('Girls')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${genderFilter === 'Girls' ? 'bg-white dark:bg-black text-rose-500 dark:text-rose-400 shadow-sm' : 'text-slate-500 dark:text-zinc-400'}`}
                      >
                        <Venus className="w-3 h-3" /> Girls
                      </button>
                    </div>

                    {/* Block Filter */}
                    <select
                      value={selectedBlockFilter}
                      onChange={(e) => setSelectedBlockFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none"
                    >
                      <option value="all">All Hostel Blocks</option>
                      {blocks.map((b) => (
                        <option key={b.Id} value={b.Id}>
                          {b.BlockName} ({b.Gender})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Rooms Grid */}
                {loading ? (
                  <div className="py-16 text-center text-slate-400 text-sm">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    <span>Loading rooms...</span>
                  </div>
                ) : filteredRooms.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 dark:text-zinc-500">
                    <BedDouble className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-zinc-700" />
                    <p className="text-sm font-bold">No rooms found matching your filter.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {blocks.length === 0
                        ? 'First create a Hostel Block in the "Hostel Blocks" tab, then add rooms to it.'
                        : 'Click "+ Add New Room" above to configure a room in one of your blocks.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRooms.map((room) => {
                      const capacity = getCapacity(room);
                      const occupied = getOccupiedCount(room);
                      const available = Math.max(0, capacity - occupied);
                      const status = getRoomStatus(room);
                      const isBoys = isBoysRoom(room);
                      const isGirls = isGirlsRoom(room);
                      const isFull = available === 0;

                      return (
                        <div
                          key={room.Id}
                          className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black p-5 space-y-4 hover:border-emerald-500/40 transition group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                                  isBoys
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    : isGirls
                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                    : 'bg-slate-200 text-slate-700'
                                }`}>
                                  {isBoys ? <Mars className="w-3 h-3" /> : <Venus className="w-3 h-3" />}
                                  {isBoys ? 'Boys Block' : isGirls ? 'Girls Block' : 'General'}
                                </span>
                                {room.BlockName && (
                                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 truncate max-w-[130px]" title={room.BlockName}>
                                    {room.BlockName}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                                Room {room.room_num}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-zinc-400">
                                {room.Type || 'Standard Room'}
                              </p>
                            </div>

                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              status === 'Fully Occupied'
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                : status === 'Available'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            }`}>
                              {status}
                            </span>
                          </div>

                          {/* Capacity Meter */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-slate-500 dark:text-zinc-400">
                                Occupancy
                              </span>
                              <span className={occupied > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'}>
                                {occupied} / {capacity} Beds Filled
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  isFull
                                    ? 'bg-rose-500'
                                    : isBoys
                                    ? 'bg-emerald-500'
                                    : 'bg-rose-400'
                                }`}
                                style={{ width: `${Math.min(100, (occupied / (capacity || 1)) * 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Quick Allocated Students Snippet */}
                          {occupied > 0 ? (
                            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
                              <span className="text-[11px] text-slate-400">Allocated ({occupied}):</span>
                              <p className="text-xs font-medium text-slate-800 dark:text-zinc-200 truncate mt-0.5">
                                {(room.participants || []).map((p) => p.UserName).join(', ')}
                              </p>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-400 italic">
                              No students currently allocated.
                            </div>
                          )}

                          {/* Room Actions */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openInspectRoom(room)}
                                className="px-3 py-1.5 rounded-lg bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50 text-slate-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                                title="View room details and allocated students"
                              >
                                <Eye className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Details ({occupied})</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditRoomModal(room)}
                                className="p-1.5 rounded-lg bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
                                title="Edit Room"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRoom(room)}
                                className="p-1.5 rounded-lg bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-rose-500/50 text-slate-600 dark:text-zinc-300 hover:text-rose-500 transition cursor-pointer"
                                title="Delete Room"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {!isFull && (
                              <button
                                type="button"
                                onClick={() => openAllocateModal(room)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-sm"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Allocate</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: HOSTEL BLOCKS */}
            {activeTab === 'blocks' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Hostel Blocks Configuration
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Create dedicated Boys and Girls hostel blocks. Rooms created in a block are designated for that block's gender.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openAddBlockModal}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer self-start sm:self-center"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Hostel Block</span>
                  </button>
                </div>

                {blocks.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 dark:text-zinc-500">
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-zinc-700" />
                    <p className="text-sm font-bold">No Hostel Blocks created yet.</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      First add your Boys and Girls hostel blocks (e.g., "Cauvery Boys Hostel" or "Ganga Girls Hostel"). After that, you can add rooms to them.
                    </p>
                    <button
                      type="button"
                      onClick={openAddBlockModal}
                      className="mt-4 px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add First Block
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {blocks.map((block) => {
                      const isBoys = block.Gender === 'Boys';
                      const blockRooms = rooms.filter((r) => String(r.BlockId) === String(block.Id));
                      const totalCap = blockRooms.reduce((sum, r) => sum + getCapacity(r), 0);
                      const totalOcc = blockRooms.reduce((sum, r) => sum + getOccupiedCount(r), 0);
                      const totalAvail = Math.max(0, totalCap - totalOcc);

                      return (
                        <div
                          key={block.Id}
                          className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black p-5 space-y-4 hover:border-emerald-500/40 transition group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 w-fit ${
                                isBoys
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              }`}>
                                {isBoys ? <Mars className="w-3 h-3" /> : <Venus className="w-3 h-3" />}
                                {isBoys ? 'Boys Hostel (Male Only)' : 'Girls Hostel (Female Only)'}
                              </span>
                              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white pt-1">
                                {block.BlockName}
                              </h3>
                              {block.Description && (
                                <p className="text-xs text-slate-500 dark:text-zinc-400">
                                  {block.Description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditBlockModal(block)}
                                className="p-1.5 rounded-lg bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
                                title="Edit Block"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBlock(block)}
                                className="p-1.5 rounded-lg bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-rose-500/50 text-slate-600 dark:text-zinc-300 hover:text-rose-500 transition cursor-pointer"
                                title="Delete Block"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Stats in Block */}
                          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-white dark:bg-black border border-slate-200/80 dark:border-zinc-800 text-center">
                            <div>
                              <p className="text-[10px] text-slate-400 font-medium">Rooms</p>
                              <p className="text-base font-bold text-slate-900 dark:text-white">
                                {blockRooms.length}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-medium">Capacity</p>
                              <p className="text-base font-bold text-slate-900 dark:text-white">
                                {totalCap}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-medium">Beds Free</p>
                              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                {totalAvail}
                              </p>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            type="button"
                            onClick={() => openAddRoomModal(block.Id)}
                            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-emerald-600 hover:text-white text-slate-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Room to {block.BlockName}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FOOD & ACCOMMODATION REQUESTS MANAGEMENT */}
            {activeTab === 'requests' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-emerald-500" />
                      <span>Physical Teams — Food &amp; Accommodation Requests</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Unified service requests submitted by teams. Directly assign rooms to unallocated participants, manage room transfers, or vacate beds.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800">
                      {requestedStudents.length} Total Requests
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {requestedStudents.filter((s) => !s.AccommodationAllocated).length} Awaiting Room
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {requestedStudents.filter((s) => s.AccommodationAllocated).length} Allocated
                    </span>
                  </div>
                </div>

                {/* Filter and Search Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search participant, email, team, college..."
                      value={requestSearch}
                      onChange={(e) => setRequestSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status filter buttons */}
                    <div className="flex items-center p-1 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setRequestStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          requestStatusFilter === 'all'
                            ? 'bg-slate-900 dark:bg-zinc-800 text-white'
                            : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        All ({requestedStudents.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setRequestStatusFilter('awaiting')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          requestStatusFilter === 'awaiting'
                            ? 'bg-amber-500 text-black'
                            : 'text-slate-500 dark:text-zinc-400 hover:text-amber-500'
                        }`}
                      >
                        <span>Awaiting</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-200 font-extrabold">
                          {requestedStudents.filter((s) => !s.AccommodationAllocated).length}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRequestStatusFilter('allocated')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          requestStatusFilter === 'allocated'
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-500 dark:text-zinc-400 hover:text-emerald-500'
                        }`}
                      >
                        <span>Allocated</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-extrabold">
                          {requestedStudents.filter((s) => s.AccommodationAllocated).length}
                        </span>
                      </button>
                    </div>

                    {/* Gender filter */}
                    <select
                      value={requestGenderFilter}
                      onChange={(e) => setRequestGenderFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    >
                      <option value="all">All Genders</option>
                      <option value="male">Male (Boys Block)</option>
                      <option value="female">Female (Girls Block)</option>
                    </select>
                  </div>
                </div>

                {requestedStudents.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 dark:text-zinc-500">
                    <Utensils className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-zinc-700" />
                    <p className="text-sm font-bold">No physical teams have requested Food &amp; Accommodation yet.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      When physical team leads enable Food &amp; Accommodation on their team dashboard, members appear here.
                    </p>
                  </div>
                ) : (() => {
                  const filteredRequests = requestedStudents.filter((student) => {
                    const isAllocated = Boolean(student.AccommodationAllocated || student.AccommodationId);
                    const sGender = String(student.Gender || '').toLowerCase().trim();
                    const isMale = ['male', 'boy', 'boys', 'm'].includes(sGender);
                    const isFemale = ['female', 'girl', 'girls', 'f'].includes(sGender);

                    // Status filter
                    if (requestStatusFilter === 'awaiting' && isAllocated) return false;
                    if (requestStatusFilter === 'allocated' && !isAllocated) return false;

                    // Gender filter
                    if (requestGenderFilter === 'male' && !isMale) return false;
                    if (requestGenderFilter === 'female' && !isFemale) return false;

                    // Search filter
                    if (requestSearch.trim()) {
                      const text = [
                        student.ParticipantName,
                        student.Email,
                        student.TeamName,
                        student.College,
                        student.TeamCollege,
                        student.Mobile,
                        student.RoomNumber,
                        student.BlockName,
                      ]
                        .filter(Boolean)
                        .join(' ')
                        .toLowerCase();
                      if (!text.includes(requestSearch.toLowerCase().trim())) return false;
                    }

                    return true;
                  });

                  if (filteredRequests.length === 0) {
                    return (
                      <div className="py-12 text-center text-slate-400 dark:text-zinc-500 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                        <p className="text-xs font-bold">No participant requests match your search and filter criteria.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setRequestSearch('');
                            setRequestStatusFilter('all');
                            setRequestGenderFilter('all');
                          }}
                          className="mt-2 text-xs font-bold text-emerald-500 hover:underline cursor-pointer"
                        >
                          Reset Filters
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-zinc-800">
                      <table className="w-full text-left text-xs min-w-[850px]">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="py-3 px-3.5">Participant</th>
                            <th className="py-3 px-3.5">Team &amp; College</th>
                            <th className="py-3 px-3.5">Gender &amp; Block Rule</th>
                            <th className="py-3 px-3.5">Accommodation Status</th>
                            <th className="py-3 px-3.5">Allocated Room</th>
                            <th className="py-3 px-3.5">Allocated At</th>
                            <th className="py-3 px-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                          {filteredRequests.map((student) => {
                            const isAllocated = Boolean(student.AccommodationAllocated || student.AccommodationId);
                            const isMale = ['male', 'boy', 'boys', 'm'].includes(String(student.Gender || '').toLowerCase());
                            const isFemale = ['female', 'girl', 'girls', 'f'].includes(String(student.Gender || '').toLowerCase());

                            return (
                              <tr key={`${student.TeamId}-${student.UserId}`} className="hover:bg-slate-50/60 dark:hover:bg-zinc-900/40 transition">
                                <td className="py-3.5 px-3.5">
                                  <p className="font-bold text-slate-900 dark:text-white">
                                    {student.ParticipantName}
                                  </p>
                                  <p className="text-[11px] text-slate-400">
                                    {student.Email} {student.Mobile ? `• ${student.Mobile}` : ''}
                                  </p>
                                </td>
                                <td className="py-3.5 px-3.5">
                                  <p className="font-semibold text-slate-800 dark:text-zinc-200">
                                    {student.TeamName}
                                  </p>
                                  <p className="text-[11px] text-slate-400">{student.TeamCollege || student.College || 'Participant'}</p>
                                </td>
                                <td className="py-3.5 px-3.5">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                                    isMale
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                      : isFemale
                                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                      : 'bg-slate-200 text-slate-600'
                                  }`}>
                                    {isMale ? <Mars className="w-3 h-3" /> : <Venus className="w-3 h-3" />}
                                    <span>{student.Gender || 'N/A'} • {isMale ? 'Boys Block' : 'Girls Block'}</span>
                                  </span>
                                </td>
                                <td className="py-3.5 px-3.5">
                                  {isAllocated ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                      <Check className="w-3 h-3" /> Allocated
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                      <Clock className="w-3 h-3" /> Awaiting Room
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-3.5">
                                  {isAllocated ? (
                                    <div>
                                      <p className="font-bold text-slate-900 dark:text-white">
                                        Room {student.RoomNumber || 'Assigned'}
                                      </p>
                                      {student.BlockName && (
                                        <p className="text-[11px] text-slate-400">{student.BlockName}</p>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 italic">Not Assigned</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-3.5 text-slate-500 dark:text-zinc-400">
                                  {student.AllocatedAt ? formatDateTime(student.AllocatedAt) : (isAllocated ? 'Recorded' : '—')}
                                </td>
                                <td className="py-3.5 px-3.5 text-right">
                                  {!isAllocated ? (
                                    <button
                                      type="button"
                                      onClick={() => openAssignStudentModal(student)}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                                      title="Assign a room in matching gender block"
                                    >
                                      <BedDouble className="w-3.5 h-3.5" />
                                      <span>Assign Room</span>
                                    </button>
                                  ) : (
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => openAssignStudentModal(student)}
                                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50 text-slate-700 dark:text-zinc-300 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                                        title="Change Room"
                                      >
                                        <Edit2 className="w-3 h-3 text-emerald-500" />
                                        <span>Change</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeallocateStudent(student.AccommodationId, student.UserId, student.ParticipantName)}
                                        disabled={deallocatingUserId === student.UserId}
                                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                                        title="Vacate Bed / Remove Student"
                                      >
                                        {deallocatingUserId === student.UserId ? (
                                          <RefreshCw className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <UserMinus className="w-3 h-3" />
                                        )}
                                        <span>Vacate</span>
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 4: FACILITY BOOKINGS & PAYMENT VERIFICATION */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-500" />
                      <span>Facility Bookings &amp; Payment Verifications</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Verify team payments for campus accommodation and meals. Inspect payment reference UTRs and receipt proofs to approve or reject requests.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800">
                      {facilityBookings.length} Total Bookings
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {facilityBookings.filter((b) => b.BookingStatus === 'Pending').length} Pending
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {facilityBookings.filter((b) => b.BookingStatus === 'Approved').length} Approved
                    </span>
                  </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-zinc-900/40 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search team, lead name, or UTR / reference..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-black rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {['all', 'Pending', 'Approved', 'Rejected'].map((statusKey) => (
                      <button
                        key={statusKey}
                        type="button"
                        onClick={() => setBookingStatusFilter(statusKey)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize shrink-0 cursor-pointer ${
                          bookingStatusFilter === statusKey
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                        }`}
                      >
                        {statusKey}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table or Cards */}
                {(() => {
                  const filtered = facilityBookings.filter((b) => {
                    if (bookingStatusFilter !== 'all' && b.BookingStatus !== bookingStatusFilter) {
                      return false;
                    }
                    if (bookingSearch.trim()) {
                      const q = bookingSearch.toLowerCase();
                      const matchName = String(b.TeamName || '').toLowerCase().includes(q);
                      const matchLead = String(b.TeamLeadName || '').toLowerCase().includes(q);
                      const matchRef = String(b.PaymentRefId || '').toLowerCase().includes(q);
                      if (!matchName && !matchLead && !matchRef) return false;
                    }
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-16 text-center rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/20">
                        <CreditCard className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-slate-700 dark:text-zinc-300">No Facility Bookings Found</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          {bookingSearch || bookingStatusFilter !== 'all'
                            ? 'No bookings match your current filter criteria.'
                            : 'Teams who request accommodation and upload payment proofs will appear here.'}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                          <tr>
                            <th className="py-3 px-4">Team &amp; Leader</th>
                            <th className="py-3 px-4">Requested</th>
                            <th className="py-3 px-4">Total Fee</th>
                            <th className="py-3 px-4">Payment UTR &amp; Notes</th>
                            <th className="py-3 px-4">Receipt Proof</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium">
                          {filtered.map((b) => (
                            <tr key={b.TeamId} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition">
                              <td className="py-3.5 px-4">
                                <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                                  {b.TeamName}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                  Lead: {b.TeamLeadName || 'N/A'} ({b.TeamLeadEmail || ''})
                                </div>
                                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                                  {b.MemberCount} Member{b.MemberCount === 1 ? '' : 's'}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <BedDouble className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-slate-700 dark:text-zinc-300">
                                    Hostel: {b.AccommodationRequested ? 'Yes' : 'No'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Utensils className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-slate-700 dark:text-zinc-300">
                                    Meals: {b.FoodAccepted ? 'Yes' : 'No'}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                                  ₹{Number(b.TotalAmount || 0)}
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-mono text-xs font-bold text-slate-800 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-900 px-2 py-1 rounded-md inline-block">
                                  {b.PaymentRefId || 'No UTR ID'}
                                </div>
                                {b.PaymentNotes && (
                                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 italic mt-1 line-clamp-2">
                                    "{b.PaymentNotes}"
                                  </p>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                {b.PaymentReceiptUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => setAdminProofModalUrl(b.PaymentReceiptUrl)}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 text-slate-800 dark:text-zinc-200 transition cursor-pointer text-xs font-bold shadow-2xs"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>View Proof</span>
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">No receipt</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${
                                  b.BookingStatus === 'Approved'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                    : b.BookingStatus === 'Rejected'
                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    b.BookingStatus === 'Approved'
                                      ? 'bg-emerald-500'
                                      : b.BookingStatus === 'Rejected'
                                      ? 'bg-rose-500'
                                      : 'bg-amber-500 animate-pulse'
                                  }`} />
                                  {b.BookingStatus}
                                </span>
                                {b.AdminRemarks && (
                                  <p className="text-[10px] text-rose-500 mt-1">
                                    Remarks: {b.AdminRemarks}
                                  </p>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  {b.BookingStatus !== 'Approved' && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateBookingStatus(b.TeamId, 'Approved')}
                                      disabled={updatingBookingStatus}
                                      className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition cursor-pointer disabled:opacity-50"
                                      title="Approve Booking"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Approve</span>
                                    </button>
                                  )}
                                  {b.BookingStatus !== 'Rejected' && (
                                    <button
                                      type="button"
                                      onClick={() => setActionModalBooking({ booking: b, newStatus: 'Rejected', remarks: '' })}
                                      disabled={updatingBookingStatus}
                                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 font-bold text-xs flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                                      title="Reject Booking"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                      <span>Reject</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL 1: ADD / EDIT HOSTEL BLOCK */}
      <AnimatePresence>
        {showBlockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {editingBlockId ? 'Edit Hostel Block' : 'Add New Hostel Block'}
                    </h3>
                    <p className="text-xs text-slate-500">Boys or Girls block configuration</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {blockError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-600 text-xs">
                  {blockError}
                </div>
              )}

              <form onSubmit={handleSaveBlock} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Hostel Block Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cauvery Boys Hostel, Block A"
                    value={blockForm.BlockName}
                    onChange={(e) => setBlockForm({ ...blockForm, BlockName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Designated Gender *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      blockForm.Gender === 'Boys'
                        ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}>
                      <input
                        type="radio"
                        name="blockGender"
                        value="Boys"
                        checked={blockForm.Gender === 'Boys'}
                        onChange={(e) => setBlockForm({ ...blockForm, Gender: e.target.value })}
                        className="accent-emerald-600"
                      />
                      <Mars className="w-4 h-4" />
                      <span className="text-xs">Boys Block (Male)</span>
                    </label>

                    <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      blockForm.Gender === 'Girls'
                        ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-bold'
                        : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}>
                      <input
                        type="radio"
                        name="blockGender"
                        value="Girls"
                        checked={blockForm.Gender === 'Girls'}
                        onChange={(e) => setBlockForm({ ...blockForm, Gender: e.target.value })}
                        className="accent-rose-500"
                      />
                      <Venus className="w-4 h-4" />
                      <span className="text-xs">Girls Block (Female)</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Description / Location Details
                  </label>
                  <textarea
                    rows="2"
                    placeholder="e.g. North Campus near main auditorium, 3 floors"
                    value={blockForm.Description}
                    onChange={(e) => setBlockForm({ ...blockForm, Description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowBlockModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={blockSaving}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {blockSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{editingBlockId ? 'Update Block' : 'Save Block'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ADD / EDIT ROOM */}
      <AnimatePresence>
        {showRoomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <BedDouble className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {editingRoomId ? 'Edit Room' : 'Add New Room'}
                    </h3>
                    <p className="text-xs text-slate-500">Configure room inside a hostel block</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {roomError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-600 text-xs">
                  {roomError}
                </div>
              )}

              <form onSubmit={handleSaveRoom} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Hostel Block *
                  </label>
                  <select
                    value={roomForm.BlockId}
                    onChange={handleRoomBlockChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  >
                    <option value="">Select a Hostel Block</option>
                    {blocks.map((b) => (
                      <option key={b.Id} value={b.Id}>
                        {b.BlockName} ({b.Gender} Block)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Room Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 101, B-204"
                      value={roomForm.roomNumber}
                      onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Bed Capacity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={roomForm.capacity}
                      onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Room Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Standard 4-Bed, AC"
                      value={roomForm.roomType}
                      onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Room Status
                    </label>
                    <select
                      value={roomForm.status}
                      onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Available">Available</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                {/* Designated Gender Info */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Designated For:</span>
                  <span className={`font-bold flex items-center gap-1.5 ${roomForm.gender === 'Boys' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                    {roomForm.gender === 'Boys' ? <Mars className="w-3.5 h-3.5" /> : <Venus className="w-3.5 h-3.5" />}
                    <span>{roomForm.gender === 'Boys' ? 'Boys Only (Male Candidates)' : 'Girls Only (Female Candidates)'}</span>
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowRoomModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={roomSaving}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {roomSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{editingRoomId ? 'Update Room' : 'Save Room'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: ROOM DETAILS & ALLOCATION INSPECTION (WHO & WHEN DETAILS) */}
      <AnimatePresence>
        {inspectingRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 space-y-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                      isBoysRoom(inspectingRoom)
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : isGirlsRoom(inspectingRoom)
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {isBoysRoom(inspectingRoom) ? <Mars className="w-3 h-3" /> : <Venus className="w-3 h-3" />}
                      {isBoysRoom(inspectingRoom) ? 'Boys Block Room' : 'Girls Block Room'}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">
                      {inspectingRoom.BlockName || 'General Block'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    Room {inspectingRoom.room_num} Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    {inspectingRoom.Type || 'Standard'} • Capacity: {getCapacity(inspectingRoom)} Beds • {getOccupiedCount(inspectingRoom)} Occupied
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectingRoom(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Occupancy Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-zinc-300">Room Occupancy</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {getOccupiedCount(inspectingRoom)} / {getCapacity(inspectingRoom)} Beds Allocated
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (getOccupiedCount(inspectingRoom) / (getCapacity(inspectingRoom) || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Allocated Students Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span>Allocated Students ({getOccupiedCount(inspectingRoom)})</span>
                  </h4>
                  {getCapacity(inspectingRoom) > getOccupiedCount(inspectingRoom) && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = inspectingRoom;
                        setInspectingRoom(null);
                        openAllocateModal(target);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Allocate Student</span>
                    </button>
                  )}
                </div>

                {(inspectingRoom.participants || []).length === 0 ? (
                  <div className="py-8 text-center text-slate-400 dark:text-zinc-500 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                    <BedDouble className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-zinc-700" />
                    <p className="text-xs font-semibold">No students currently allocated to this room.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click "Allocate Student" to assign participants.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {(inspectingRoom.participants || []).map((student, idx) => (
                      <div
                        key={student.UserId || idx}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-500/30 transition"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {student.UserName ? student.UserName.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                {student.UserName}
                              </h5>
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                                {student.Gender || 'N/A'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                              {student.Email} {student.Mobile ? `• ${student.Mobile}` : ''}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-600 dark:text-zinc-300">
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                Team: {student.TeamName || 'Physical Team'}
                              </span>
                              {student.College && <span>• College: {student.College}</span>}
                            </div>
                            {/* ALLOCATION TIMESTAMP */}
                            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                              <Clock className="w-3 h-3 text-emerald-500" />
                              <span className="font-medium">
                                Allocated on: {student.AllocatedAt ? formatDateTime(student.AllocatedAt) : 'Recorded in Session'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Deallocate button */}
                        <button
                          type="button"
                          disabled={deallocatingUserId === student.UserId}
                          onClick={() => handleDeallocateStudent(inspectingRoom.Id, student.UserId, student.UserName)}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 transition self-end sm:self-center shrink-0 cursor-pointer disabled:opacity-50"
                          title="Remove student from room"
                        >
                          {deallocatingUserId === student.UserId ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserMinus className="w-3.5 h-3.5" />
                          )}
                          <span>Remove</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setInspectingRoom(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: STRICT GENDER-BASED ALLOCATION MODAL */}
      <AnimatePresence>
        {allocatingRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 space-y-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                      isBoysRoom(allocatingRoom)
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}>
                      {isBoysRoom(allocatingRoom) ? <Mars className="w-3 h-3" /> : <Venus className="w-3 h-3" />}
                      {isBoysRoom(allocatingRoom) ? 'Boys Block Room' : 'Girls Block Room'}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                      {allocatingRoom.BlockName}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Allocate Students to Room {allocatingRoom.room_num}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Remaining capacity: <strong className="text-emerald-600 dark:text-emerald-400">{Math.max(0, getCapacity(allocatingRoom) - getOccupiedCount(allocatingRoom))} bed(s)</strong> available.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAllocatingRoom(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* STRICT GENDER POLICY BANNER */}
              <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-3 ${
                isBoysRoom(allocatingRoom)
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400'
              }`}>
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-extrabold">
                    {isBoysRoom(allocatingRoom)
                      ? 'Strict Gender Policy: Male Candidates Only'
                      : 'Strict Gender Policy: Female Candidates Only'}
                  </p>
                  <p className="text-[11px] opacity-90">
                    {isBoysRoom(allocatingRoom)
                      ? 'This room is located in a Boys Block. The candidate list below is automatically filtered to show only Male participants.'
                      : 'This room is located in a Girls Block. The candidate list below is automatically filtered to show only Female participants.'}
                  </p>
                </div>
              </div>

              {allocationError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-600 text-xs">
                  {allocationError}
                </div>
              )}

              {/* Student Filter Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter eligible candidates by name, email, college..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              {/* Candidate Selection List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {eligibleStudents
                  .filter((student) => {
                    const text = [
                      student.ParticipantName,
                      student.Email,
                      student.TeamName,
                      student.College,
                    ]
                      .join(' ')
                      .toLowerCase();
                    return text.includes(studentSearch.toLowerCase().trim());
                  })
                  .map((student) => {
                    const isSelected = selectedStudents.includes(String(student.UserId));
                    const capacityLeft = Math.max(0, getCapacity(allocatingRoom) - getOccupiedCount(allocatingRoom));
                    const disabled = !isSelected && selectedStudents.length >= capacityLeft;

                    return (
                      <div
                        key={student.UserId}
                        onClick={() => !disabled && toggleStudentSelection(student)}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                            : disabled
                            ? 'opacity-40 border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 cursor-not-allowed'
                            : 'border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50 bg-white dark:bg-black'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={disabled}
                            onChange={() => toggleStudentSelection(student)}
                            className="accent-emerald-600 h-4 w-4 rounded cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {student.ParticipantName}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                                {student.Gender}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              {student.Email} • Team: {student.TeamName}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                            Selected
                          </span>
                        )}
                      </div>
                    );
                  })}

                {eligibleStudents.length === 0 && (
                  <div className="py-8 text-center text-slate-400 dark:text-zinc-500">
                    <p className="text-xs font-bold">
                      No unallocated {isBoysRoom(allocatingRoom) ? 'Male' : 'Female'} students found who requested Food &amp; Accommodation.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      All matching participants for this gender have already been assigned rooms.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                  Selected: <strong className="text-slate-900 dark:text-white">{selectedStudents.length}</strong> / {Math.max(0, getCapacity(allocatingRoom) - getOccupiedCount(allocatingRoom))} beds
                </span>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAllocatingRoom(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAllocation}
                    disabled={allocating || selectedStudents.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {allocating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                    <span>Confirm Allocation ({selectedStudents.length})</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: ASSIGN / CHANGE ROOM FOR INDIVIDUAL PARTICIPANT */}
      <AnimatePresence>
        {assigningStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 space-y-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <BedDouble className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {assigningStudent.AccommodationAllocated || assigningStudent.AccommodationId ? 'Change Room Assignment' : 'Assign Room to Participant'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {assigningStudent.ParticipantName} ({assigningStudent.Email})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAssigningStudent(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student Details Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800 dark:text-zinc-200">
                    Team: {assigningStudent.TeamName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    College: {assigningStudent.College || assigningStudent.TeamCollege || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    ['male', 'boy', 'boys', 'm'].includes(String(assigningStudent.Gender || '').toLowerCase())
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}>
                    {['male', 'boy', 'boys', 'm'].includes(String(assigningStudent.Gender || '').toLowerCase()) ? (
                      <>
                        <Mars className="w-3.5 h-3.5" />
                        <span>Male (Boys Block Only)</span>
                      </>
                    ) : (
                      <>
                        <Venus className="w-3.5 h-3.5" />
                        <span>Female (Girls Block Only)</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {assignRoomError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-600 text-xs">
                  {assignRoomError}
                </div>
              )}

              {/* Room Selection */}
              <form onSubmit={handleConfirmSingleStudentAssignment} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Select Available Room in {['male', 'boy', 'boys', 'm'].includes(String(assigningStudent.Gender || '').toLowerCase()) ? 'Boys' : 'Girls'} Block:
                  </label>

                  {(() => {
                    const isStudentMale = ['male', 'boy', 'boys', 'm'].includes(String(assigningStudent.Gender || '').toLowerCase());
                    const eligibleRooms = rooms.filter((r) => {
                      const matchesGender = isStudentMale ? isBoysRoom(r) : isGirlsRoom(r);
                      if (!matchesGender) return false;
                      if (r.Status === 'Maintenance') return false;
                      const bedsAvailable = getCapacity(r) - getOccupiedCount(r);
                      const isCurrentRoom = String(r.Id) === String(assigningStudent.AccommodationId);
                      return bedsAvailable > 0 || isCurrentRoom;
                    });

                    if (eligibleRooms.length === 0) {
                      return (
                        <div className="py-8 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-2">
                          <BedDouble className="w-8 h-8 mx-auto text-slate-400" />
                          <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                            No available beds in {isStudentMale ? 'Boys' : 'Girls'} Blocks!
                          </p>
                          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                            All {isStudentMale ? 'Boys' : 'Girls'} rooms are either full or not configured yet. Please add a room to a {isStudentMale ? 'Boys' : 'Girls'} block.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setAssigningStudent(null);
                              openAddRoomModal();
                            }}
                            className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add New Room</span>
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                        {eligibleRooms.map((room) => {
                          const bedsLeft = Math.max(0, getCapacity(room) - getOccupiedCount(room));
                          const isSelected = String(room.Id) === String(targetRoomId);
                          const isCurrent = String(room.Id) === String(assigningStudent.AccommodationId);

                          return (
                            <div
                              key={room.Id}
                              onClick={() => setTargetRoomId(String(room.Id))}
                              className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-2 ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500/30'
                                  : 'border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 bg-white dark:bg-black'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    {room.BlockName || (isBoysRoom(room) ? 'Boys Block' : 'Girls Block')}
                                  </span>
                                  <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                    Room {room.room_num}
                                  </h5>
                                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                    {room.Type || 'Standard'}
                                  </p>
                                </div>
                                <input
                                  type="radio"
                                  name="targetRoom"
                                  checked={isSelected}
                                  onChange={() => setTargetRoomId(String(room.Id))}
                                  className="accent-emerald-600 mt-0.5"
                                />
                              </div>

                              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 dark:border-zinc-900">
                                <span className={`font-bold ${bedsLeft > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                  {bedsLeft} free bed{bedsLeft !== 1 ? 's' : ''}
                                </span>
                                {isCurrent ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                                    Current
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400">
                                    Cap: {getCapacity(room)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setAssigningStudent(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAssigningRoom || !targetRoomId}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isAssigningRoom ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Confirm Bed Assignment</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: BOOKING ACTION / REJECTION REMARKS */}
      <AnimatePresence>
        {actionModalBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Reject Facility Booking</h4>
                    <p className="text-xs text-slate-400">Team: {actionModalBooking.booking?.TeamName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActionModalBooking(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                  Reason for Rejection *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. UTR reference not matching bank account, payment screenshot blurry, or amount underpaid."
                  value={actionModalBooking.remarks}
                  onChange={(e) => setActionModalBooking((prev) => ({ ...prev, remarks: e.target.value }))}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActionModalBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateBookingStatus(actionModalBooking.booking.TeamId, 'Rejected', actionModalBooking.remarks)}
                  disabled={updatingBookingStatus}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {updatingBookingStatus ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 6: ADMIN RECEIPT ZOOM PREVIEW */}
      <AnimatePresence>
        {adminProofModalUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setAdminProofModalUrl(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-2xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setAdminProofModalUrl(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-200 transition cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-full text-center pb-3 border-b border-slate-100 dark:border-zinc-800 mb-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Payment Receipt Proof</h4>
              </div>
              <div className="overflow-auto max-h-[75vh] w-full flex items-center justify-center p-2">
                {adminProofModalUrl.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={adminProofModalUrl}
                    className="w-full h-[65vh] rounded-xl"
                    title="Payment PDF"
                  />
                ) : (
                  <img
                    src={adminProofModalUrl}
                    alt="Payment Proof"
                    className="max-w-full max-h-[70vh] object-contain rounded-xl"
                  />
                )}
              </div>
              <div className="pt-3">
                <a
                  href={adminProofModalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Document</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}

export default AccomodationRedirectPage;
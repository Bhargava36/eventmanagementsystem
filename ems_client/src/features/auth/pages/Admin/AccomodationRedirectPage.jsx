import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  BedDouble,
  ArrowLeft,
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

  const [rooms, setRooms] = useState([]);
  const [requestedStudents, setRequestedStudents] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState('');
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [allocatingRoom, setAllocatingRoom] = useState(null);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [allocationError, setAllocationError] = useState('');
  const [allocationMessage, setAllocationMessage] = useState('');

  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: '',
    capacity: '',
    gender: 'Boys',
  });

  const getRoomId = (room) => room.Id ?? room.id;
  const getRoomNumber = (room) => room.room_num ?? 'N/A';
  const getCapacity = (room) => Number(room.Capacity ?? room.capacity ?? 0);
  const getOccupiedCount = (room) => {
    if (room.Occupied != null) return Number(room.Occupied);
    if (room.occupiedCount != null) return Number(room.occupiedCount);
    if (room.occupied != null && !Number.isNaN(Number(room.occupied))) {
      return Number(room.occupied);
    }
    if (Array.isArray(room.participants)) return room.participants.length;
    if (Array.isArray(room.studentsList)) return room.studentsList.length;
    return 0;
  };
  const getGender = (room) => String(room.Gender ?? room.gender ?? room.category ?? '').toLowerCase().trim();
  const getRoomType = (room) => room.Type ?? room.type ?? room.roomType ?? 'Standard';
  const getUserId = (user) => user.Id ?? user.id ?? user._id ?? user.UserId ?? user.userId;
  const getStudentName = (student) => student.UserName ?? student.username ?? student.Name ?? student.name ?? 'Unnamed Student';
  const getStudentEmail = (student) => student.Email ?? student.email ?? '';
  const getStudentRollNumber = (student) => student.RollNumber ?? student.rollNumber ?? student.RollNo ?? student.rollNo ?? '';
  const getStudentGender = (student) => String(student.Gender ?? student.gender ?? '').toLowerCase().trim();
  const studentAlreadyAllocated = (student) => { const value = student.AccommodationAllocated ?? student.accommodationAllocated ?? student.IsAllocated ?? student.isAllocated ?? student.allocated;
    return (
      value === true || value === 1 || Boolean( student.AccommodationId ?? student.accommodationId ?? student.RoomId ?? student.roomId ?? student.allocatedRoom )
    );
  };

  const getStudents = (room) => {
    const students = room.participants ?? room.studentsList;
    if (Array.isArray(students)) {
      if (students.length === 0) return 'No students assigned';
      return students.map((student) => typeof student === 'string' ? student : getStudentName(student)).join(', ');
    }
    return typeof room.students === 'string'
      ? room.students
      : 'Student details unavailable';
  };
  const getRoomStatus = (room) => {
    const capacity = getCapacity(room);
    const occupied = getOccupiedCount(room);
    const storedStatus = room.Status ?? room.status;
    if (storedStatus === 'Maintenance') return 'Maintenance';
    if (capacity > 0 && occupied >= capacity) return 'Fully Occupied';
    if (occupied > 0) return 'Partially Filled';
    return 'Available';
  };

  const getStatusBadge = (status) => {
    if (status === 'Fully Occupied') {
      return 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400';
    }
    if (status === 'Available') {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
    }
    if (status === 'Maintenance') {
      return 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300';
    }
    return 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400';
  };

  const isBoysRoom = (room) =>['male', 'boy', 'boys', 'm'].includes(getGender(room));

  const isGirlsRoom = (room) => ['female', 'girl', 'girls', 'f'].includes(getGender(room));

  const getAvailableRooms = (roomList) =>
    roomList.filter(
      (room) =>
        getRoomStatus(room) !== 'Maintenance' &&
        getOccupiedCount(room) < getCapacity(room)
    );
  const getAllocatedRooms = (roomList) => roomList.filter((room) => getOccupiedCount(room) > 0);
  const formatDate = (date) => {
    if (!date) return 'Date not available';
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return String(date);
    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };

  const getRoomsFromResponse = (result) => {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result.data)) return result.data;
    if (Array.isArray(result.rooms)) return result.rooms;
    if (Array.isArray(result.data?.rooms)) return result.data.rooms;
    return [];
  };

  const fetchAccommodation = useCallback(async (signal) => {
    const [response, eventResponse] = await Promise.all([
      fetch(`http://localhost:3000/api/accommodation`, { signal }),
      eventId
        ? fetch(`http://localhost:3000/api/events/${encodeURIComponent(eventId)}`, { signal })
        : Promise.resolve(null)
    ]);
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.message ||
        `Unable to fetch accommodation details (${response.status}).`
      );
    }

    let roomList = getRoomsFromResponse(result);
    if (eventId) {
      const hasEventReference = roomList.some(
        (room) =>
          room.eventId != null ||
          room.EventId != null ||
          room.event?.id != null ||
          room.event?._id != null
      );

      if (hasEventReference) {
        roomList = roomList.filter((room) => {
          const roomEventId =
            room.eventId ??
            room.EventId ??
            room.event?.id ??
            room.event?._id;

          return String(roomEventId) === String(eventId);
        });
      }
    }

    let eventDetails =
      result.event ??
      result.data?.event ??
      roomList.find((room) => room.event)?.event ??
      roomList.find((room) => room.eventDetails)?.eventDetails ??
      null;

    if (eventResponse) {
      const eventResult = await eventResponse.json().catch(() => ({}));
      if (!eventResponse.ok) {
        throw new Error(
          eventResult.message || `Unable to fetch event details (${eventResponse.status}).`
        );
      }
      eventDetails =
        eventResult.event ??
        eventResult.data?.event ??
        eventResult.data ??
        eventResult;
    }

    setRooms(roomList);
    setEvent(eventDetails);
  }, [eventId]);

  useEffect(() => {
    const controller = new AbortController();

    const loadAccommodation = async () => {
      try {
        setLoading(true);
        setError('');
        await fetchAccommodation(controller.signal);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load accommodation details.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadAccommodation();
    return () => controller.abort();
  }, [eventId, fetchAccommodation]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchAccommodationRequests = async () => {
      if (!eventId) {
        setRequestsError('No event is assigned to this accommodation page.');
        setRequestsLoading(false);
        return;
      }

      try {
        setRequestsLoading(true);
        setRequestsError('');
        const response = await fetch(
          `http://localhost:3000/api/physical-services/events/${encodeURIComponent(eventId)}/accommodation-participants`,
          { signal: controller.signal }
        );
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result.message || 'Unable to load accommodation requests.');
        }
        setRequestedStudents(Array.isArray(result.participants) ? result.participants : []);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setRequestsError(requestError.message || 'Unable to load accommodation requests.');
          setRequestedStudents([]);
        }
      } finally {
        if (!controller.signal.aborted) setRequestsLoading(false);
      }
    };

    fetchAccommodationRequests();
    return () => controller.abort();
  }, [eventId]);

  const resetForm = () => {
    setFormData({
      roomNumber: '',
      roomType: '',
      capacity: '',
      gender: 'Boys',
    });
    setEditingRoomId(null);
    setFormError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleAddRoomClick = () => {
    resetForm();
    setSuccessMessage('');
    setShowForm((previous) => !previous);
  };

  const handleEditRoom = (room) => {
    const roomId = getRoomId(room);

    if (!roomId) {
      setError('Room ID not found. Unable to edit this room.');
      return;
    }

    setEditingRoomId(roomId);
    setFormData({
      roomNumber: String(
        getRoomNumber(room) === 'N/A' ? '' : getRoomNumber(room)
      ),
      roomType: String(getRoomType(room)),
      capacity: String(getCapacity(room)),
      gender: isGirlsRoom(room) ? 'Girls' : 'Boys',
    });

    setFormError('');
    setSuccessMessage('');
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    setFormError('');
    setError('');
    setSuccessMessage('');

    if (
      !formData.roomNumber.trim() ||
      !formData.roomType.trim() ||
      formData.capacity === ''
    ) {
      setFormError('Room number, room type and student capacity are required.');
      return;
    }

    const capacity = Number(formData.capacity);

    if (!Number.isInteger(capacity) || capacity < 1) {
      setFormError('Student capacity must be a positive whole number.');
      return;
    }

    const existingRoom = editingRoomId
      ? rooms.find((room) => String(getRoomId(room)) === String(editingRoomId))
      : null;

    const currentOccupied = existingRoom ? getOccupiedCount(existingRoom) : 0;

    if (capacity < currentOccupied) {
      setFormError(
        `This room already has ${currentOccupied} students. Capacity cannot be less than the current occupied count.`
      );
      return;
    }

    const roomData = {
      room_num: formData.roomNumber.trim(),
      Type: formData.roomType.trim(),
      Gender: formData.gender,
      Capacity: capacity,
    };

    if (!editingRoomId) {
      roomData.Occupied = 0;
      roomData.UserId = null;
      roomData.Status = 'Available';
    }

    try {
      setSaving(true);

      const url = editingRoomId
        ? `http://localhost:3000/api/accommodation/${editingRoomId}`
        : `http://localhost:3000/api/accommodation`;

      const response = await fetch(url, {
        method: editingRoomId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
          result.error ||
          `Unable to ${editingRoomId ? 'update' : 'add'} the room.`
        );
      }

      const wasEditing = Boolean(editingRoomId);
      resetForm();
      setShowForm(false);
      await fetchAccommodation();

      setSuccessMessage(
        result.message ||
        (wasEditing ? 'Room updated successfully.' : 'Room added successfully.')
      );
    } catch (err) {
      setFormError(err.message || 'Unable to save room details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async (room) => {
    const roomId = getRoomId(room);

    if (!roomId) {
      setError('Room ID not found. Unable to delete this room.');
      return;
    }

    const occupied = getOccupiedCount(room);
    const message =
      occupied > 0
        ? `${getRoomNumber(room)} has ${occupied} allocated student(s). Are you sure you want to delete this room?`
        : `Are you sure you want to delete room ${getRoomNumber(room)}?`;

    if (!window.confirm(message)) return;

    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(
        `http://localhost:3000/api/accommodation/${roomId}`,
        { method: 'DELETE' }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || result.error || 'Unable to delete the room.'
        );
      }

      if (String(editingRoomId) === String(roomId)) {
        resetForm();
        setShowForm(false);
      }

      if (
        allocatingRoom &&
        String(getRoomId(allocatingRoom)) === String(roomId)
      ) {
        closeAllocationPanel();
      }

      await fetchAccommodation();
      setSuccessMessage(result.message || 'Room deleted successfully.');
    } catch (err) {
      setError(err.message || 'Failed to delete the room.');
    }
  };

  const closeAllocationPanel = () => {
    setAllocatingRoom(null);
    setEligibleStudents([]);
    setSelectedStudents([]);
    setStudentSearch('');
    setAllocationError('');
    setAllocationMessage('');
  };

  const handleAllocateStudents = async (room) => {
    const roomId = getRoomId(room);

    if (!roomId) {
      setAllocationError('Room ID not found.');
      return;
    }

    if (getOccupiedCount(room) >= getCapacity(room)) {
      setAllocationError('This room is already full.');
      return;
    }

    setAllocatingRoom(room);
    setSelectedStudents([]);
    setStudentSearch('');
    setAllocationError('');
    setAllocationMessage('');
    setStudentsLoading(true);

    window.setTimeout(() => {
      document.getElementById('student-allocation-panel')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);

    try {
      const response = await fetch(`http://localhost:3000/api/users`);
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || 'Unable to load students. Check the users API.'
        );
      }

      const users = Array.isArray(result)
        ? result
        : result.users || result.students || result.data || [];

      const roomGender = getGender(room);

      const roomStudentIds = new Set(
        [
          ...(Array.isArray(room.participants) ? room.participants : []),
          ...(Array.isArray(room.studentsList) ? room.studentsList : []),
        ].map((student) =>
          String(
            typeof student === 'object' ? getUserId(student) : student
          )
        )
      );

      const usersById = new Map(
        users.map((student) => [String(getUserId(student)), student])
      );
      const eligible = requestedStudents
        .map((request) => ({
          ...(usersById.get(String(request.UserId)) || {}),
          ...request,
        }))
        .filter((student) => {
        const studentId = getUserId(student);
        const studentGender = getStudentGender(student);

        const genderMatches = isBoysRoom(room)
          ? ['boy', 'boys', 'male', 'm'].includes(studentGender)
          : isGirlsRoom(room)
            ? ['girl', 'girls', 'female', 'f'].includes(studentGender)
            : studentGender === roomGender;

        return (
          studentId != null &&
          genderMatches &&
          !studentAlreadyAllocated(student) &&
          !roomStudentIds.has(String(studentId))
        );
      });

      setEligibleStudents(eligible);
    } catch (err) {
      setAllocationError(
        err.message ||
        'Unable to load eligible students. Please check your API.'
      );
    } finally {
      setStudentsLoading(false);
    }
  };

  const toggleStudent = (student) => {
    const studentId = getUserId(student);

    if (studentId == null) {
      setAllocationError('Student ID not found in the API response.');
      return;
    }

    const id = String(studentId);
    const capacityLeft = Math.max(
      0,
      getCapacity(allocatingRoom) - getOccupiedCount(allocatingRoom)
    );

    setAllocationError('');

    setSelectedStudents((current) => {
      if (current.includes(id)) {
        return current.filter((selectedId) => selectedId !== id);
      }

      if (current.length >= capacityLeft) {
        setAllocationError(
          `Only ${capacityLeft} student(s) can be selected for this room.`
        );
        return current;
      }

      return [...current, id];
    });
  };

  const handleSaveAllocation = async () => {
    if (!allocatingRoom || selectedStudents.length === 0) {
      setAllocationError('Please select at least one student.');
      return;
    }

    const capacityLeft = Math.max(
      0,
      getCapacity(allocatingRoom) - getOccupiedCount(allocatingRoom)
    );

    if (selectedStudents.length > capacityLeft) {
      setAllocationError(
        `Only ${capacityLeft} student(s) can be allocated to this room.`
      );
      return;
    }

    setAllocating(true);
    setAllocationError('');
    setAllocationMessage('');

    try {
      const roomId = getRoomId(allocatingRoom);

      const response = await fetch(
        `http://localhost:3000/api/accommodation/${roomId}/allocate`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: Number(eventId),
            studentIds: selectedStudents.map(Number),
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
          'Allocation failed. Check whether the backend allocation endpoint exists.'
        );
      }

      setAllocationMessage(
        result.message || 'Students allocated successfully.'
      );
      setSelectedStudents([]);

      await fetchAccommodation();

      const refreshedRoomResponse = await fetch(
        `http://localhost:3000/api/accommodation/${roomId}`
      );
      const refreshedRoomResult = await refreshedRoomResponse
        .json()
        .catch(() => ({}));

      if (refreshedRoomResponse.ok) {
        const refreshedRoom =
          refreshedRoomResult.data ||
          refreshedRoomResult.accommodation ||
          refreshedRoomResult.room ||
          refreshedRoomResult;

        setAllocatingRoom(refreshedRoom);
        await handleAllocateStudents(refreshedRoom);
      }
    } catch (err) {
      setAllocationError(
        err.message || 'Unable to allocate participants to this room.'
      );
    } finally {
      setAllocating(false);
    }
  };

  const eventName =
    event?.eventName ??
    event?.EventName ??
    event?.name ??
    event?.title ??
    'Accommodation Management';

  const eventStartDate =
    event?.startDate ??
    event?.start_date ??
    event?.eventStartDate ??
    event?.eventDate ??
    event?.date;

  const eventEndDate =
    event?.endDate ?? event?.end_date ?? event?.eventEndDate ?? eventStartDate;

  const eventLocation =
    event?.location ??
    event?.Location ??
    event?.venue ??
    event?.eventLocation ??
    event?.address ??
    'Location not available';

  const boysRooms = rooms.filter(isBoysRoom);
  const girlsRooms = rooms.filter(isGirlsRoom);

  const totalRooms = rooms.length;
  const allocatedRooms = rooms.filter(
    (room) => getOccupiedCount(room) > 0
  ).length;
  const availableRooms = getAvailableRooms(rooms).length;

  const totalParticipants = rooms.reduce(
    (total, room) => total + getOccupiedCount(room),
    0
  );

  const stats = [
    { label: 'Total Rooms', value: totalRooms, icon: BedDouble },
    { label: 'Allocated Rooms', value: allocatedRooms, icon: Users },
    { label: 'Available Rooms', value: availableRooms, icon: Clock },
    { label: 'Allocated Students', value: totalParticipants, icon: Users },
  ];

  const filteredRooms = (roomList) =>
    roomList.filter((room) => {
      const searchText = [
        getRoomNumber(room),
        getRoomType(room),
        getStudents(room),
        getRoomStatus(room),
      ]
        .join(' ')
        .toLowerCase();

      return searchText.includes(searchTerm.trim().toLowerCase());
    });

  const accommodationSections = [
    {
      title: 'Boys Accommodation',
      gender: 'boys',
      icon: Mars,
      rooms: boysRooms,
    },
    {
      title: 'Girls Accommodation',
      gender: 'girls',
      icon: Venus,
      rooms: girlsRooms,
    },
  ];

  const renderRoomActions = (room) => {
    const roomId = getRoomId(room);

    return (
      <div className="flex flex-wrap justify-end gap-2">

        <button
          type="button"
          disabled={!roomId}
          onClick={() => handleEditRoom(room)}
          aria-label="Edit room"
          title="Edit room"
          className="rounded-lg border border-emerald-200 p-2 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
        >
          <Edit2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          disabled={!roomId}
          onClick={() => handleDeleteRoom(room)}
          aria-label="Delete room"
          title="Delete room"
          className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  };

  const filteredEligibleStudents = eligibleStudents.filter((student) => {
    const text = [
      getStudentName(student),
      getStudentEmail(student),
      getStudentRollNumber(student),
    ]
      .join(' ')
      .toLowerCase();

    return text.includes(studentSearch.trim().toLowerCase());
  });

  return (
    <main className="min-h-screen w-full bg-slate-50 p-3 font-sans text-slate-900 dark:bg-[#070908] dark:text-white sm:p-5 xl:p-8">
      <div className="mx-auto w-full max-w-[1600px] space-y-5">
        <button
          type="button"
          onClick={() => navigate('/admin/physical-event')}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium text-slate-600 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Physical Event
        </button>

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => {
                setError('');
                setLoading(true);
                fetchAccommodation()
                  .catch((err) =>
                    setError(err.message || 'Unable to load rooms.')
                  )
                  .finally(() => setLoading(false));
              }}
              className="shrink-0 font-bold underline"
            >
              Retry
            </button>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400">
            <span>{successMessage}</span>
            <button
              type="button"
              onClick={() => setSuccessMessage('')}
              aria-label="Dismiss success message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <section className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6 xl:flex-row xl:items-center xl:p-8">
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                <BedDouble className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Accommodation Management
              </h1>
            </div>

            <p className="max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
              Manage rooms, allocate students and maintain accommodation
              details for the physical event.
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {eventName}
              </span>

              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  {eventStartDate
                    ? formatDate(eventStartDate)
                    : 'Start date not available'}
                  {eventEndDate && eventEndDate !== eventStartDate
                    ? ` – ${formatDate(eventEndDate)}`
                    : ''}
                </span>
              </span>

              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{eventLocation}</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddRoomClick}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3.5 text-sm font-bold text-white hover:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 sm:w-auto sm:min-w-[190px]"
          >
            {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {showForm ? 'Close Form' : 'Add New Room'}
          </button>
        </section>

        <section className="rounded-3xl border border-emerald-200 bg-white p-4 shadow-sm dark:border-emerald-900/60 dark:bg-zinc-950 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Team Accommodation Requests</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Team leads’ saved requests apply to every registered member.
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
              {requestsLoading
                ? 'Loading requests…'
                : `${requestedStudents.length} members · ${new Set(requestedStudents.map((student) => student.TeamId)).size} teams`}
            </div>
          </div>

          {requestsError ? (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
              {requestsError}
            </p>
          ) : requestsLoading ? (
            <p className="py-6 text-center text-sm text-slate-500">Loading team requests…</p>
          ) : requestedStudents.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-zinc-900 dark:text-slate-400">
              No teams have requested accommodation yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:border-zinc-800">
                    <th className="px-3 py-3">Participant</th>
                    <th className="px-3 py-3">Team</th>
                    <th className="px-3 py-3">Team lead</th>
                    <th className="px-3 py-3">Gender</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {requestedStudents.map((student) => (
                    <tr key={`${student.TeamId}-${student.UserId}`}>
                      <td className="px-3 py-3">
                        <p className="font-semibold">{student.ParticipantName}</p>
                        <p className="text-xs text-slate-500">{student.Email}</p>
                      </td>
                      <td className="px-3 py-3 font-medium">{student.TeamName}</td>
                      <td className="px-3 py-3">
                        <p>{student.TeamLeadName}</p>
                        <p className="text-xs text-slate-500">{student.TeamLeadEmail}</p>
                      </td>
                      <td className="px-3 py-3">{student.Gender || 'Not provided'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {showForm && (
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6 xl:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                {editingRoomId ? (
                  <Edit2 className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
                ) : (
                  <Plus className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {editingRoomId ? 'Edit Room' : 'Add New Room'}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Capacity means the maximum number of students who can stay in
                  this room.
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveRoom} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <label htmlFor="roomNumber" className="mb-2 block text-sm font-semibold">
                    Room Number *
                  </label>
                  <input
                    id="roomNumber"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    placeholder="Example: BH1-21"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>

                <div>
                  <label htmlFor="roomType" className="mb-2 block text-sm font-semibold">
                    Room Type *
                  </label>
                  <input
                    id="roomType"
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleInputChange}
                    placeholder="Standard / Shared"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>

                <div>
                  <label htmlFor="capacity" className="mb-2 block text-sm font-semibold">
                    Student Capacity *
                  </label>
                  <input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="Maximum students"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Enter maximum students, not beds.
                  </p>
                </div>

                <div>
                  <label htmlFor="gender" className="mb-2 block text-sm font-semibold">
                    Accommodation For *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col justify-end gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-60 dark:bg-emerald-500"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : editingRoomId ? 'Update Room' : 'Save Room'}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-5"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                <stat.icon className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {stat.label}
              </p>
              <p className="mt-1 text-2xl font-extrabold">
                {loading ? '—' : stat.value}
              </p>
            </div>
          ))}
        </section>

        {!loading && !error && rooms.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <BedDouble className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-3 text-lg font-bold">No accommodation rooms found</h2>
            <p className="mt-1 text-sm text-slate-500">
              Click Add New Room to create your first room.
            </p>
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-zinc-800 dark:bg-zinc-950">
            Loading accommodation details...
          </div>
        )}

        {!loading &&
          !error &&
          accommodationSections.map((section) => {
            const availableList = getAvailableRooms(section.rooms);
            const allocatedList = getAllocatedRooms(section.rooms);
            const visibleRooms = filteredRooms(allocatedList);
            const SectionIcon = section.icon;

            return (
              <section
                key={section.gender}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6 xl:p-8"
              >
                <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 dark:border-zinc-800 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                      <SectionIcon className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold sm:text-xl">{section.title}</h2>
                      <p className="text-sm text-slate-500">
                        Manage rooms and student allocation.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Total', value: section.rooms.length },
                      { label: 'Allocated', value: allocatedList.length },
                      { label: 'Available', value: availableList.length },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl bg-slate-50 px-3 py-2 text-center dark:bg-zinc-900"
                      >
                        <p className="text-[10px] font-bold uppercase text-slate-400">
                          {item.label}
                        </p>
                        <p className="mt-1 text-lg font-extrabold">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 2xl:grid-cols-12">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 2xl:col-span-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                      <BedDouble className="h-4 w-4 text-emerald-700 dark:text-emerald-500" />
                      <h3 className="text-sm font-bold">Available Rooms</h3>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {availableList.map((room) => {
                        const roomId = getRoomId(room);
                        const capacity = getCapacity(room);
                        const occupied = getOccupiedCount(room);

                        return (
                          <div
                            key={roomId ?? getRoomNumber(room)}
                            className="space-y-3 px-4 py-4 hover:bg-slate-50 dark:hover:bg-zinc-900/50"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold">
                                  {getRoomNumber(room)}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {getRoomType(room)}
                                </p>
                              </div>
                              <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold ${getStatusBadge(getRoomStatus(room))}`}>
                                {getRoomStatus(room)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>Students: {occupied}/{capacity}</span>
                              <span>{capacity - occupied} spots left</span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{
                                  width: `${capacity > 0 ? Math.min((occupied / capacity) * 100, 100) : 0}%`,
                                }}
                              />
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => handleAllocateStudents(room)}
                                disabled={!roomId}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50 dark:bg-emerald-500"
                              >
                                <UserPlus className="h-4 w-4" />
                                Allocate Students
                              </button>
                              {renderRoomActions(room)}
                            </div>
                          </div>
                        );
                      })}

                      {availableList.length === 0 && (
                        <p className="p-5 text-center text-xs text-slate-500">
                          No available rooms.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 2xl:col-span-8">
                    <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/50 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-emerald-700 dark:text-emerald-500" />
                        <h3 className="text-sm font-bold">Allocated Rooms</h3>
                      </div>
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search room or student..."
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-950"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[850px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-zinc-800">
                            <th className="px-4 py-3">Room No.</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3 text-center">Student Capacity</th>
                            <th className="px-4 py-3 text-center">Occupied</th>
                            <th className="px-4 py-3">Students</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                          {visibleRooms.map((room) => {
                            const status = getRoomStatus(room);
                            const roomId = getRoomId(room);
                            const capacity = getCapacity(room);
                            const occupied = getOccupiedCount(room);

                            return (
                              <tr
                                key={roomId ?? getRoomNumber(room)}
                                className="hover:bg-slate-50 dark:hover:bg-zinc-900/50"
                              >
                                <td className="px-4 py-4 font-bold">{getRoomNumber(room)}</td>
                                <td className="px-4 py-4 text-xs text-slate-500">{getRoomType(room)}</td>
                                <td className="px-4 py-4 text-center">{capacity} students</td>
                                <td className="px-4 py-4 text-center">{occupied}/{capacity}</td>
                                <td className="max-w-[200px] truncate px-4 py-4 text-xs">{getStudents(room)}</td>
                                <td className="px-4 py-4">
                                  <span className={`inline-flex rounded px-2 py-1 text-[10px] font-bold ${getStatusBadge(status)}`}>
                                    {status}
                                  </span>
                                </td>
                                <td className="px-4 py-4">{renderRoomActions(room)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {visibleRooms.length === 0 && (
                      <p className="p-6 text-center text-sm text-slate-500">
                        No allocated rooms match your search.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            );
          })}

        {allocatingRoom && (
          <section
            id="student-allocation-panel"
            className="scroll-mt-5 rounded-3xl border border-emerald-200 bg-white p-4 shadow-sm dark:border-emerald-900 dark:bg-zinc-950 sm:p-6 xl:p-8"
          >
            <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 dark:border-zinc-800 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                  <UserPlus className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold">Allocate Students</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Room {getRoomNumber(allocatingRoom)} · {getRoomType(allocatingRoom)} ·{' '}
                    {isBoysRoom(allocatingRoom) ? 'Boys' : 'Girls'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeAllocationPanel}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold dark:border-zinc-700"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-zinc-900">
                <p className="text-xs font-semibold text-slate-500">Room Capacity</p>
                <p className="mt-1 text-xl font-extrabold">{getCapacity(allocatingRoom)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-zinc-900">
                <p className="text-xs font-semibold text-slate-500">Already Allocated</p>
                <p className="mt-1 text-xl font-extrabold">{getOccupiedCount(allocatingRoom)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-zinc-900">
                <p className="text-xs font-semibold text-slate-500">Remaining Capacity</p>
                <p className="mt-1 text-xl font-extrabold">
                  {Math.max(0, getCapacity(allocatingRoom) - getOccupiedCount(allocatingRoom))}
                </p>
              </div>
            </div>

            {allocationError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                {allocationError}
              </div>
            )}

            {allocationMessage && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400">
                {allocationMessage}
              </div>
            )}

            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-bold">Students who requested accommodation</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Only eligible {isBoysRoom(allocatingRoom) ? 'Boys' : 'Girls'} are shown.
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search name, email or roll number..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
            </div>

            {studentsLoading ? (
              <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500 dark:bg-zinc-900">
                Loading eligible students...
              </div>
            ) : filteredEligibleStudents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-zinc-700">
                <Users className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-3 font-semibold">No eligible students found</p>
                <p className="mt-1 text-sm text-slate-500">
                  Check the accommodation request field and student gender in your users API.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEligibleStudents.map((student) => {
                  const studentId = String(getUserId(student));
                  const checked = selectedStudents.includes(studentId);
                  const capacityLeft = Math.max(
                    0,
                    getCapacity(allocatingRoom) - getOccupiedCount(allocatingRoom)
                  );

                  return (
                    <label
                      key={studentId}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                        checked
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/5'
                          : 'border-slate-200 hover:border-emerald-300 dark:border-zinc-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!checked && selectedStudents.length >= capacityLeft}
                        onChange={() => toggleStudent(student)}
                        className="h-4 w-4 accent-emerald-600"
                      />
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 dark:bg-zinc-800 dark:text-white">
                        {getStudentName(student).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{getStudentName(student)}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {getStudentEmail(student) || 'No email available'}
                        </p>
                        {getStudentRollNumber(student) && (
                          <p className="mt-1 text-xs text-slate-500">
                            Roll No: {getStudentRollNumber(student)}
                          </p>
                        )}
                      </div>
                      {checked && (
                        <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex flex-col justify-between gap-4 border-t border-slate-100 pt-5 dark:border-zinc-800 sm:flex-row sm:items-center">
              <p className="text-sm text-slate-500">
                Selected: <span className="font-bold text-slate-900 dark:text-white">{selectedStudents.length}</span>
                {' / '}
                {Math.max(0, getCapacity(allocatingRoom) - getOccupiedCount(allocatingRoom))}
                {' students'}
              </p>

              <button
                type="button"
                onClick={handleSaveAllocation}
                disabled={allocating || studentsLoading || selectedStudents.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500"
              >
                <UserPlus className="h-4 w-4" />
                {allocating ? 'Allocating...' : 'Allocate Selected Students'}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default AccomodationRedirectPage;
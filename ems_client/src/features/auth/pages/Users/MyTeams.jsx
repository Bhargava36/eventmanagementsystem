import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users
} from 'lucide-react';

function MyTeams() {

  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyTeams();
  }, []);

  const fetchMyTeams = async () => {

    try {

      setLoading(true);
      setError('');

      const user = JSON.parse(
        localStorage.getItem('user')
      );
      console.log('Logged in user:', user);
      const userId = user?.Id;

      if (!userId) {
        setError('User ID not found');
        return;
      }

      const response = await fetch(
        `http://localhost:3000/api/teams/my-teams/${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to fetch teams'
        );
      }

      setTeams(data.teams || []);

    } catch (err) {

      console.error('Get my teams error:', err);

      setError(
        err.message || 'Failed to load teams'
      );

    } finally {

      setLoading(false);

    }
  };

  const getCardImage = (eventName) => {

    return (
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-slate-100 text-center shadow-[0_0_0_1px_rgba(16,185,129,0.18)] dark:border-slate-700 dark:bg-black">

        <span className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">
          {eventName}
        </span>

      </div>
    );
  };

  const handleCardClick = (teamId) => {

    navigate(`/user/teamInfo/${teamId}`);

  };

  const formatDate = (date) => {

    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  };

  if (loading) {

    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white dark:bg-black">

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading teams...
        </p>

      </div>
    );
  }

  if (error) {

    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white dark:bg-black">

        <div className="text-center">

          <p className="mb-4 text-sm text-red-500">
            {error}
          </p>

          <button
            onClick={fetchMyTeams}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  return (

    <div className="flex min-h-screen w-full justify-center bg-white p-4 text-slate-900 transition-colors duration-200 dark:bg-black dark:text-white sm:p-6 md:p-8 lg:p-12">

      <div className="flex w-full max-w-5xl flex-col">

        <div className="mb-8">

          <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            My Teams
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Events where you are registered as a team lead or team member
          </p>

        </div>

        {teams.length === 0 ? (

          <div className="rounded-2xl border border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-[#0b0b0b]">

            <Users className="mx-auto mb-4 h-10 w-10 text-slate-400" />

            <p className="text-sm text-slate-500 dark:text-slate-400">
              You are not part of any team yet.
            </p>

          </div>

        ) : (

          <div className="flex flex-col gap-4">

            {teams.map((team) => (

              <button
                key={team.TeamId}
                onClick={() =>
                  handleCardClick(team.TeamId)
                }
                className="group w-full rounded-2xl border border-slate-300 bg-white p-4 text-left shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-[#0b0b0b] dark:shadow-[0_8px_24px_rgba(0,0,0,0.32)] dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.4)]"
              >

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                  <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl sm:w-40">

                    {getCardImage(
                      team.EventName
                    )}

                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-3">

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-500 dark:text-emerald-400">
                          Participated Event
                        </p>

                        <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                          {team.EventName}
                        </h3>

                      </div>

                      <span className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        {team.Role?.toLowerCase() === 'teamlead'
                          ? 'Team Lead'
                          : 'Team Member'}
                      </span>

                    </div>

                    <div className="grid gap-2 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">

                      <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950/80">

                        <Calendar className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />

                        <span>
                          {formatDate(team.StartDate)}
                        </span>

                      </div>

                      <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950/80">

                        <Users className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />

                        <span>
                          {team.TeamName}
                        </span>

                      </div>

                      <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950/80 sm:col-span-2">

                        <Users className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />

                        <span>
                          {team.TeamSize} Members
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              </button>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default MyTeams;
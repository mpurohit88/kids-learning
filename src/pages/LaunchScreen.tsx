import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { profiles } from '../data/profiles'
import { useAppStore } from '../store/useAppStore'

export function LaunchScreen() {
  const navigate = useNavigate()
  const setProfile = useAppStore((state) => state.setProfile)

  const handleSelect = (profileId: string) => {
    setProfile(profileId)
    navigate('/home')
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <p className="text-lg font-medium text-slate-600">Welcome!</p>
        <h1 className="mt-2 text-4xl font-extrabold text-slate-800 md:text-5xl">
          Who is learning today?
        </h1>
        <p className="mt-3 text-lg text-slate-500">Tap your picture to start</p>
      </motion.div>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
        {profiles.map((profile, index) => (
          <motion.button
            key={profile.id}
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelect(profile.id)}
            className="flex min-h-56 flex-col items-center justify-center rounded-[2rem] border-4 border-white p-8 text-white shadow-xl"
            style={{ backgroundColor: profile.color }}
          >
            <span className="text-7xl">{profile.avatar}</span>
            <span className="mt-4 text-4xl font-bold">{profile.name}</span>
            <span className="mt-2 text-lg opacity-90">{profile.description}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

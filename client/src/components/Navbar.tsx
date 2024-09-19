import peerShareLogo from '../assets/peerShare-icon.png'

const Navbar = () => {
  return (
    <nav className="bg-white flex gap-1 items-center p-3">
      <img src={peerShareLogo} alt="peerShare Logo"  className='h-12'/>
      <div className='space-y-2 '>
      <h2 className='text-4xl'> <span className='text-[#2C167F] font-semibold'>Peer</span><span className='text-[#7752FE] font-medium'>Share</span></h2>
      <span className='italic text-base font-medium text-[#2C167F]'>A p2p file sharing app</span>
      </div>
    </nav>
  )
}

export default Navbar



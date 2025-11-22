import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Job from '@/pages/Job.vue'
import Account from '@/pages/Account.vue'
import Profile from '@/pages/Profile.vue'
import MainLayout from '@/layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'Home', component: Home},
      { path: 'job', name: 'Job', component: Job},
      { path: 'account', name: 'Account', component: Account}, 
      { path: 'profile', name: 'Profile', component: Profile},
      { path: 'selectAdress', name: 'SelectAddress', component: () => import ('@/pages/SelectAddress.vue')}
      
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router

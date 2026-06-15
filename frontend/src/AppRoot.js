import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logoutSuccess, updateUser } from './store/features/auth/authSlice';
import {
  setJobs,
  upsertJob,
  removeJob,
  setCategories,
  setFavorites,
  addFavorite as addFavoriteAction,
  removeFavorite as removeFavoriteAction,
} from './store/features/home/homeSlice';

import { HomeScreen } from './screens/HomeScreen';
import { JobDetailScreen } from './screens/JobDetailScreen';
import { JobFormScreen } from './screens/JobFormScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import {
  createJob,
  deleteJob,
  getJobById,
  getJobs,
  updateJob,
  login,
  register,
  logout,
  getCurrentUser,
  setCurrentUser,
  getCategories,
  getFavorites,
  addFavorite as addFavoriteApi,
  removeFavorite,
} from './api/jobsApi';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({
  jobs,
  favoriteIds,
  toggleFavorite,
  user,
  categories,
  favorites,
  removeJobFromState,
  dispatch,
}) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') iconName = 'home';
          else if (route.name === 'FavoritesTab') iconName = 'star';
          else if (route.name === 'ProfileTab') iconName = 'person';
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
      })}
    >
      <Tab.Screen name="HomeTab" options={{ title: 'Trang chủ' }}>
        {(props) => (
          <HomeRoute
            {...props}
            jobs={jobs}
            favoriteIds={favoriteIds}
            toggleFavorite={toggleFavorite}
            user={user}
            categories={categories}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="FavoritesTab" options={{ title: 'Yêu thích' }}>
        {(props) => (
          <HomeScreen
            {...props}
            jobs={jobs.filter((j) => favoriteIds.has(j.id))}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
            onSelectJob={(jobId) => props.navigation.navigate('JobDetail', { jobId })}
            categories={categories}
            isFavoritesOnly={true}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="ProfileTab" options={{ title: 'Hồ sơ' }}>
        {(props) => (
          <ProfileScreen
            {...props}
            user={user}
            jobs={jobs}
            favorites={favorites}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
            onSelectJob={(jobId) => props.navigation.navigate('JobDetail', { jobId })}
            onEditJob={(job) =>
              props.navigation.navigate('JobForm', { mode: 'edit', jobId: job.id })
            }
            onDeleteJob={async (jobId) => {
              await deleteJob(jobId);
              removeJobFromState(jobId);
            }}
            onUpdateUser={(updatedUser) => {
              dispatch(updateUser(updatedUser));
              setCurrentUser(updatedUser);
            }}
            onLogout={() => {
              logout();
              dispatch(logoutSuccess());
            }}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function normalizeOptional(value) {
  return value ?? null;
}

function areJobsEqual(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;

  // Chỉ cần so sánh ID là đủ để biết dữ liệu có thay đổi không
  return a.every((jobA, index) => jobA.id === b[index].id);
}

function CenterMessage({ title, subtitle }) {
  return (
    <View style={styles.center}>
      <Text style={styles.centerTitle}>{title}</Text>
      {subtitle ? <Text style={styles.centerSub}>{subtitle}</Text> : null}
    </View>
  );
}

function HeaderWithProfile({ navigation, user, onLogout }) {
  return (
    <SafeAreaView style={styles.headerBar} edges={['top']}>
      <View style={styles.logoWrapper}>
        <Image
          source={require('../assets/2.png')}
          style={styles.logo}
          resizeMode="cover"
        />
      </View>
      <Pressable
        style={styles.profileButton}
        onPress={() => navigation.navigate('ProfileTab')}
      >
        <Text style={styles.profileButtonText} numberOfLines={1}>
          {user?.fullName?.split(' ')[0] || 'User'} {user?.role === 'admin' ? '(Admin)' : ''}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

function HomeRoute({ navigation, jobs, favoriteIds, toggleFavorite, user, categories }) {
  return (
    <View style={styles.homeContainer}>
      <HeaderWithProfile
        navigation={navigation}
        user={user}
        onLogout={() => navigation.navigate('Home')}
      />
      <View style={{ flex: 1 }}>
        <HomeScreen
          jobs={jobs}
          favoriteIds={favoriteIds}
          onToggleFavorite={toggleFavorite}
          onSelectJob={(jobId) => navigation.navigate('JobDetail', { jobId })}
          onAddJob={() => navigation.navigate('JobForm', { mode: 'create' })}
          categories={categories}
        />
      </View>
    </View>
  );
}

function JobDetailRoute({
  navigation,
  route,
  jobs,
  favoriteIds,
  toggleFavorite,
  upsertJobInState,
  removeJobFromState,
  user,
}) {
  const jobId = useMemo(() => {
    const raw = route?.params?.jobId;
    const n = typeof raw === 'string' ? Number(raw) : raw;
    return Number.isFinite(n) ? n : null;
  }, [route?.params?.jobId]);

  const job = useMemo(() => {
    if (jobId == null) return null;
    return jobs.find((j) => j.id === jobId) ?? null;
  }, [jobs, jobId]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const load = async () => {
        if (jobId == null) return;
        try {
          const latest = await getJobById(jobId);
          if (cancelled) return;
          if (latest) upsertJobInState(latest);
        } catch {
          // ignore
        }
      };
      load();
      return () => {
        cancelled = true;
      };
    }, [jobId, upsertJobInState])
  );

  if (jobId == null) {
    return (
      <CenterMessage
        title="Thiếu dữ liệu"
        subtitle="Không tìm thấy jobId để mở chi tiết."
      />
    );
  }

  if (!job) {
    return <CenterMessage title="Đang tải..." subtitle="Vui lòng chờ." />;
  }

  const canEdit = user?.role === 'admin' || job.userId === user?.id;

  return (
    <JobDetailScreen
      job={job}
      user={user}
      isFavorite={favoriteIds.has(job.id)}
      onBack={() => navigation.goBack()}
      onToggleFavorite={() => toggleFavorite(job.id)}
      onEdit={
        canEdit
          ? () => navigation.navigate('JobForm', { mode: 'edit', jobId: job.id })
          : null
      }
      onDelete={
        canEdit
          ? async () => {
              await deleteJob(job.id);
              removeJobFromState(job.id);
              navigation.goBack();
            }
          : null
      }
    />
  );
}

function JobFormRoute({ navigation, route, jobs, upsertJobInState, user, categories }) {
  const mode = route?.params?.mode === 'edit' ? 'edit' : 'create';
  const jobId = useMemo(() => {
    const raw = route?.params?.jobId;
    const n = typeof raw === 'string' ? Number(raw) : raw;
    return Number.isFinite(n) ? n : null;
  }, [route?.params?.jobId]);

  const localJob = useMemo(() => {
    if (mode !== 'edit' || jobId == null) return null;
    return jobs.find((j) => j.id === jobId) ?? null;
  }, [jobs, jobId, mode]);

  const [initialJob, setInitialJob] = useState(localJob);
  useEffect(() => {
    setInitialJob(localJob);
  }, [localJob]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (mode !== 'edit' || jobId == null) return;
      if (localJob) return;
      try {
        const remote = await getJobById(jobId);
        if (cancelled) return;
        if (remote) setInitialJob(remote);
      } catch {
        // ignore
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [jobId, localJob, mode]);

  const [submitting, setSubmitting] = useState(false);

  const submit = async (payload) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (mode === 'edit') {
        if (jobId == null) throw new Error('Missing jobId');
        // Check if user can edit
        const canEdit = user?.role === 'admin' || initialJob?.userId === user?.id;
        if (!canEdit) {
          throw new Error('Bạn không có quyền sửa bài đăng này');
        }
        const updated = await updateJob(jobId, payload);
        upsertJobInState(updated);
        navigation.goBack();
        return;
      }

      const created = await createJob(payload, user?.id);
      upsertJobInState(created);
      navigation.goBack();
    } catch (err) {
      console.warn(err);
      Alert.alert('Lỗi', err.message || 'Không lưu được việc. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <JobFormScreen
      mode={mode}
      initialJob={initialJob}
      categories={categories}
      onCancel={() => navigation.goBack()}
      onSubmit={submit}
      submitting={submitting}
    />
  );
}

export default function AppRoot() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items: jobs, categories, favorites, favoriteIds: favoriteIdsArray } = useSelector((state) => state.home);
  const favoriteIds = useMemo(() => new Set(favoriteIdsArray), [favoriteIdsArray]);

  const [showingRegister, setShowingRegister] = useState(false);

  // Sync Redux user with jobsApi internal state
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  // Load categories and favorites when user is logged in
  useEffect(() => {
    if (user) {
      const loadExtras = async () => {
        try {
          const cats = await getCategories();
          dispatch(setCategories(cats));
          const favs = await getFavorites();
          dispatch(setFavorites(favs));
        } catch (err) {
          console.error('AppRoot load extras error:', err);
        }
      };
      loadExtras();
    } else {
      dispatch(setCategories([]));
      dispatch(setFavorites([]));
    }
  }, [user, dispatch]);

  // Fetch jobs periodically (separate effect to avoid prop drilling)
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    let inFlight = false;

    const fetchJobs = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const data = await getJobs();
        if (cancelled) return;
        const nextJobs = Array.isArray(data) ? data : [];
        if (!areJobsEqual(jobs, nextJobs)) {
          dispatch(setJobs(nextJobs));
        }
      } catch (err) {
        console.error('AppRoot fetch jobs error:', err);
      } finally {
        inFlight = false;
      }
    };

    // Fetch immediately on mount
    fetchJobs();
    // Then poll every 4 seconds
    const intervalId = setInterval(fetchJobs, 4000);
    
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [user, jobs, dispatch]);

  const toggleFavorite = useCallback(async (jobId) => {
    if (!user) return;
    
    // Find if already favorited
    const existing = favorites.find(f => f.jobId === jobId);
    
    try {
      if (existing) {
        // Remove
        await removeFavorite(existing.id);
        dispatch(removeFavoriteAction(existing.id));
      } else {
        // Add
        const created = await addFavoriteApi(jobId);
        dispatch(addFavoriteAction(created));
      }
    } catch (err) {
      console.error('AppRoot toggle favorite error:', err);
      Alert.alert('Lỗi', 'Không thể cập nhật danh sách yêu thích.');
    }
  }, [user, favorites, dispatch]);

  const upsertJobInState = useCallback((job) => {
    if (!job) return;
    dispatch(upsertJob(job));
  }, [dispatch]);

  const removeJobFromState = useCallback((jobId) => {
    dispatch(removeJob(jobId));
  }, [dispatch]);

  const handleLogin = async (loginUser) => {
    dispatch(loginSuccess(loginUser));
    setCurrentUser(loginUser);
    setShowingRegister(false);
  };

  const handleRegister = async (registeredUser) => {
    setShowingRegister(false);
  };

  const handleLogout = () => {
    dispatch(logoutSuccess());
    logout();
    setShowingRegister(false);
  };

  if (!user) {
    if (showingRegister) {
      return (
        <SafeAreaProvider>
          <RegisterScreen
            onRegisterSuccess={handleRegister}
            onLoginPress={() => setShowingRegister(false)}
          />
          <StatusBar style="auto" />
        </SafeAreaProvider>
      );
    }

    return (
      <SafeAreaProvider>
        <LoginScreen
          onLoginSuccess={handleLogin}
          onRegisterPress={() => setShowingRegister(true)}
        />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main">
            {(props) => (
              <MainTabs
                {...props}
                jobs={jobs}
                favoriteIds={favoriteIds}
                toggleFavorite={toggleFavorite}
                user={user}
                categories={categories}
                favorites={favorites}
                removeJobFromState={removeJobFromState}
                dispatch={dispatch}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="JobDetail">
            {(props) => (
              <JobDetailRoute
                {...props}
                jobs={jobs}
                favoriteIds={favoriteIds}
                toggleFavorite={toggleFavorite}
                upsertJobInState={upsertJobInState}
                removeJobFromState={removeJobFromState}
                user={user}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="JobForm">
            {(props) => (
              <JobFormRoute
                {...props}
                jobs={jobs}
                upsertJobInState={upsertJobInState}
                user={user}
                categories={categories}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  centerTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'Roboto-Bold' },
  centerSub: { marginTop: 8, color: '#6b7280', textAlign: 'center', fontFamily: 'Roboto-Regular' },
  homeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  logoWrapper: {
    backgroundColor: '#f1f5f9',
    width: 70,
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  profileButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  profileButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});

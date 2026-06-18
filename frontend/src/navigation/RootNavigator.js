import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { HomeScreen } from '../screens/HomeScreen';
import { JobDetailScreen } from '../screens/JobDetailScreen';
import { JobFormScreen } from '../screens/JobFormScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

import { updateUser, logoutSuccess } from '../redux/features/auth/authSlice';

import {
  createJob,
  deleteJob,
  getJobById,
  getJobs,
  updateJob,
  logout,
  setCurrentUser,
} from '../api/jobsApi';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
          source={require('../../assets/2.png')}
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

export function RootNavigator({
  jobs,
  favoriteIds,
  toggleFavorite,
  user,
  categories,
  favorites,
  removeJobFromState,
  upsertJobInState,
  dispatch,
}) {
  return (
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

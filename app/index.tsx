import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const projects = [
  {
    id: 'smartspace',
    title: 'Smartspace',
    description: 'Conference Room & Visitor Booking System',
    icon: 'calendar-outline' as keyof typeof Ionicons.glyphMap,
    path: '/conference-booking',
    enabled: true,
  },
  {
    id: 'hm-clockr',
    title: 'HM Clockr',
    description: 'HR Management & Time Tracking',
    icon: 'time-outline' as keyof typeof Ionicons.glyphMap,
    path: '/hm-clockr',
    enabled: false,
  },
  {
    id: 'complaints',
    title: 'Complaints & Feedback',
    description: 'Employee Feedback & Issue Reporting',
    icon: 'chatbubble-outline' as keyof typeof Ionicons.glyphMap,
    path: '/complaints-and-feedback',
    enabled: false,
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const handleProjectClick = (project: typeof projects[0]) => {
    if (project.enabled) {
      router.push(project.path as any);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Digital Hub Apps</Text>
        <Text style={styles.subtitle}>Select a project to get started</Text>
      </View>

      <View style={styles.projectsContainer}>
        {projects.map((project) => {
          return (
            <TouchableOpacity
              key={project.id}
              style={[
                styles.projectCard,
                !project.enabled && styles.projectCardDisabled,
              ]}
              onPress={() => handleProjectClick(project)}
              disabled={!project.enabled}
              activeOpacity={project.enabled ? 0.7 : 1}
            >
              <View style={[
                styles.iconContainer,
                !project.enabled && styles.iconContainerDisabled,
              ]}>
                <Ionicons name={project.icon} size={32} color={project.enabled ? '#007AFF' : '#999'} />
              </View>
              <Text style={[
                styles.projectTitle,
                !project.enabled && styles.projectTitleDisabled,
              ]}>
                {project.title}
              </Text>
              <Text style={[
                styles.projectDescription,
                !project.enabled && styles.projectDescriptionDisabled,
              ]}>
                {project.description}
              </Text>
              <View style={[
                styles.button,
                !project.enabled && styles.buttonDisabled,
              ]}>
                <Text style={[
                  styles.buttonText,
                  !project.enabled && styles.buttonTextDisabled,
                ]}>
                  {project.enabled ? 'Open App' : 'Coming Soon'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  projectsContainer: {
    width: '100%',
    maxWidth: 800,
    gap: 16,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  projectCardDisabled: {
    opacity: 0.6,
    borderColor: '#E0E0E0',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconContainerDisabled: {
    backgroundColor: '#F5F5F5',
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  projectTitleDisabled: {
    color: '#999',
  },
  projectDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  projectDescriptionDisabled: {
    color: '#999',
  },
  button: {
    width: '100%',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#999',
  },
});


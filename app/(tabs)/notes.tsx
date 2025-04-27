import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Modal, SafeAreaView, Pressable, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getDb } from '@/util/db';
import { StatusBar } from 'expo-status-bar';

interface Note {
    id: number;
    title: string;
    content: string;
    created_at: number;
}

const Notes = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentNote, setCurrentNote] = useState<Partial<Note>>({ id: undefined, title: '', content: '' });
    const [isEditing, setIsEditing] = useState(false);

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme];

    // CREATE TABLE on mount
    useEffect(() => {
        (async () => {
            const db = await getDb();
            try {
                await db.execAsync(`
          CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            created_at INTEGER
          );
        `);
                console.log('✅ Table ensured');
                await loadNotes();
            } catch (error) {
                console.error('❌ Error creating table:', error);
            }
        })();
    }, []);

    // LOAD NOTES
    const loadNotes = async () => {
        const db = await getDb();
        try {
            const result = await db.getAllAsync<Note>('SELECT * FROM notes ORDER BY created_at DESC');
            setNotes(result);
        } catch (error) {
            console.error('❌ Error loading notes:', error);
        }
    };

    // SAVE OR UPDATE NOTE
    const saveNote = async () => {
        const db = await getDb();
        if (!currentNote.title?.trim() && !currentNote.content?.trim()) {
            Alert.alert('Error', 'Please enter a title or content for your note');
            return;
        }

        try {
            if (isEditing && currentNote.id !== undefined) {
                await db.runAsync(
                    'UPDATE notes SET title = ?, content = ? WHERE id = ?',
                    [currentNote.title || '', currentNote.content || '', currentNote.id]
                );
            } else {
                await db.runAsync(
                    'INSERT INTO notes (title, content, created_at) VALUES (?, ?, ?)',
                    [currentNote.title || '', currentNote.content || '', Date.now()]
                );
            }
            await loadNotes();
            closeModal();
        } catch (error) {
            console.error('❌ Error saving note:', error);
        }
    };

    // DELETE NOTE
    const deleteNote = async (id: number) => {
        Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    const db = await getDb();
                    try {
                        await db.runAsync('DELETE FROM notes WHERE id = ?', id);
                        await loadNotes();
                        if (modalVisible && currentNote.id === id) closeModal();
                    } catch (error) {
                        console.error('❌ Error deleting note:', error);
                    }
                },
            },
        ]);
    };

    // MODAL HANDLERS
    const openNewNoteModal = () => {
        setCurrentNote({ id: undefined, title: '', content: '' });
        setIsEditing(false);
        setModalVisible(true);
    };

    const openEditNoteModal = (note: Note) => {
        setCurrentNote(note);
        setIsEditing(true);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setCurrentNote({ id: undefined, title: '', content: '' });
    };

    const renderNoteItem = ({ item }: { item: Note }) => {
        const noteTitle = item.title.trim() ? item.title : 'Untitled Note';
        const notePreview = item.content.length > 30 ? `${item.content.substring(0, 30)}...` : item.content;
        const createdDate = new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });

        return (
            <TouchableOpacity
                style={styles.noteItem}
                onPress={() => openEditNoteModal(item)}
                activeOpacity={0.8}
            >
                <View style={styles.noteContent}>
                    <View style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Text style={styles.noteTitle} numberOfLines={1} ellipsizeMode="tail">
                            {noteTitle}
                        </Text>

                        <View style={styles.dateContainer}>
                            <Feather name="calendar" size={12} color="#7B8794" />
                            <Text style={styles.dateText}>{createdDate}</Text>
                        </View>
                    </View>
                    <View style={styles.noteDetailsContainer}>
                        <Text style={styles.notePreview} numberOfLines={1} ellipsizeMode="tail">
                            {notePreview}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteNote(item.id)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Feather name="trash-2" size={18} color="#FF6B6B" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>Click + to add a new note</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.header}>Notes</Text>

                <FlatList
                    data={notes}
                    renderItem={renderNoteItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.notesList}
                    ListEmptyComponent={renderEmptyList}
                />

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={openNewNoteModal}
                >
                    <Feather name="plus" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Note Editor Modal */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={closeModal} style={styles.backButton}>
                            <Feather name="arrow-left" size={24} color="#1DB954" />
                        </TouchableOpacity>

                        <View style={styles.modalActions}>
                            {isEditing && typeof currentNote.id === 'number' && (
                                <TouchableOpacity
                                    style={styles.deleteButtonModal}
                                    onPress={() => currentNote.id && deleteNote(currentNote.id)}
                                >
                                    <Feather name="trash-2" size={24} color="#FF6B6B" />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
                                <Feather name="check" size={24} color="#1DB954" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.editorContainer}>
                        <TextInput
                            style={styles.titleInput}
                            placeholder="Title"
                            placeholderTextColor="#787878"
                            value={currentNote.title}
                            onChangeText={(text) => setCurrentNote({ ...currentNote, title: text })}
                        />

                        <TextInput
                            style={styles.contentInput}
                            placeholder="Start typing..."
                            placeholderTextColor="#787878"
                            multiline
                            value={currentNote.content}
                            onChangeText={(text) => setCurrentNote({ ...currentNote, content: text })}
                        />
                    </View>
                </SafeAreaView>
            </Modal>

            <StatusBar style="dark" />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFC',
        paddingTop: 14,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 24,
        marginTop: 12,
        color: '#181818',
        paddingHorizontal: 8,
    },
    notesList: {
        flexGrow: 1,
        paddingBottom: 80,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#787878',
        opacity: 0.7,
    },
    noteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginBottom: 12,
        marginHorizontal: 8,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.06,
        // shadowRadius: 4,
        // elevation: 2,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    noteContent: {
        flex: 1,
        marginRight: 12,
    },
    noteTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#181818',
        marginBottom: 6,
    },
    noteDetailsContainer: {
        flexDirection: 'column',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    dateText: {
        fontSize: 12,
        color: '#787878',
        marginLeft: 4,
    },
    notePreview: {
        fontSize: 14,
        color: '#585858',
    },
    deleteButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#EFEFEF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    addButton: {
        position: 'absolute',
        right: 24,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#0a7ea4',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
    },
    backButton: {
        padding: 8,
    },
    modalActions: {
        flexDirection: 'row',
    },
    saveButton: {
        padding: 8,
    },
    deleteButtonModal: {
        padding: 8,
        marginRight: 8,
    },
    editorContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    titleInput: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        padding: 12,
        color: '#181818',
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    contentInput: {
        flex: 1,
        fontSize: 16,
        textAlignVertical: 'top',
        padding: 12,
        color: '#181818',
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
});

export default Notes;
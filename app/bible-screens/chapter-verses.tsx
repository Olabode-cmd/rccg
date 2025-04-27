import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, StatusBar } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import bible from "@/assets/bible/en_kjv.json";
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';

const ChapterVerses = () => {
    const params = useLocalSearchParams();
    const bookIndex = Number(params.book);
    const chapterIndex = Number(params.chapter);
    const initialVerseIndex = params.verse ? Number(params.verse) : null;

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme];
    const router = useRouter();

    // State declarations
    const [bookName, setBookName] = useState<string>('');
    const [verses, setVerses] = useState<string[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentSpeakingVerse, setCurrentSpeakingVerse] = useState<number | null>(null);
    const [currentVerse, setCurrentVerse] = useState<number>(0);
    const [isPaused, setIsPaused] = useState(false);

    // Refs
    const flatListRef = useRef<FlatList>(null);

    // Type assertion for Bible structure
    const typedBible = bible as Array<{
        abbrev: string,
        name?: string,
        chapters: string[][]
    }>;

    // Get book name and verses on component mount
    useEffect(() => {
        if (bookIndex >= 0 && bookIndex < typedBible.length &&
            chapterIndex >= 0 && chapterIndex < typedBible[bookIndex].chapters.length) {
            const book = typedBible[bookIndex];
            setBookName(book.name || book.abbrev || `Book ${bookIndex + 1}`);
            setVerses(book.chapters[chapterIndex]);
        }
    }, [bookIndex, chapterIndex]);

    // Scroll to initial verse if provided
    useEffect(() => {
        if (initialVerseIndex !== null && verses.length > 0) {
            setTimeout(() => {
                setCurrentSpeakingVerse(initialVerseIndex);
                flatListRef.current?.scrollToIndex({
                    index: initialVerseIndex,
                    animated: true,
                    viewPosition: 0.3,
                });

                // Remove highlight after 2 seconds
                setTimeout(() => {
                    setCurrentSpeakingVerse(null);
                }, 2000);
            }, 100);
        }
    }, [initialVerseIndex, verses]);

    // Clean up speech when component unmounts
    useEffect(() => {
        return () => {
            Speech.stop();
        };
    }, []);

    const handleBack = () => {
        router.back();
    };

    // Navigate to next chapter
    const handleNextChapter = () => {
        const currentBookChapters = typedBible[bookIndex].chapters.length;

        // If this is the last chapter of the book
        if (chapterIndex >= currentBookChapters - 1) {
            // If this is not the last book
            if (bookIndex < typedBible.length - 1) {
                router.push(`/bible-screens/chapter-verses?book=${bookIndex + 1}&chapter=0`);
            }
        } else {
            // Move to next chapter in current book
            router.push(`/bible-screens/chapter-verses?book=${bookIndex}&chapter=${chapterIndex + 1}`);
        }
    };

    // Navigate to previous chapter
    const handlePreviousChapter = () => {
        // If this is the first chapter of the book
        if (chapterIndex <= 0) {
            // If this is not the first book
            if (bookIndex > 0) {
                const prevBookChapters = typedBible[bookIndex - 1].chapters.length;
                router.push(`/bible-screens/chapter-verses?book=${bookIndex - 1}&chapter=${prevBookChapters - 1}`);
            }
        } else {
            // Move to previous chapter in current book
            router.push(`/bible-screens/chapter-verses?book=${bookIndex}&chapter=${chapterIndex - 1}`);
        }
    };

    const speakVerse = (text: string, onComplete?: () => void) => {
        Speech.speak(text, {
            onStart: () => {
                // Verse started speaking
            },
            onDone: () => {
                // Always call onComplete when verse is done, regardless of pause state
                onComplete?.();
            },
            onError: (error) => {
                setIsSpeaking(false);
                setCurrentSpeakingVerse(null);
            },
            rate: 0.9,
            pitch: 1.0,
            language: 'en-US'
        });
    };

    const speakVerses = (verses: string[], startIndex: number = 0, force: boolean = false) => {
        if (!isSpeaking && !force) {
            return;
        }

        setCurrentVerse(startIndex);
        setCurrentSpeakingVerse(startIndex);

        const verseText = String(verses[startIndex]);
        const verseToSpeak = `Verse ${startIndex + 1}. ${verseText}`;

        flatListRef.current?.scrollToIndex({
            index: startIndex,
            animated: true,
            viewPosition: 0.5,
        });

        speakVerse(verseToSpeak, () => {
            if ((isSpeaking || force) && startIndex + 1 < verses.length) {
                speakVerses(verses, startIndex + 1, force);
            } else if (startIndex + 1 >= verses.length) {
                setIsSpeaking(false);
                setCurrentSpeakingVerse(null);
                setCurrentVerse(0);
            }
        });
    };

    const restartSpeech = () => {
        Speech.stop();
        speakVerses(verses, 0);
    };

    const togglePause = async () => {
        if (isPaused) {
            // Resume by starting current verse again
            setIsPaused(false);
            speakVerses(verses, currentVerse, true);
        } else {
            // Simple pause - just stop speaking
            setIsPaused(true);
            await Speech.stop();
        }
    };

    const moveToVerse = (direction: 'next' | 'prev') => {
        const newIndex = direction === 'next' ?
            Math.min(currentVerse + 1, verses.length - 1) :
            Math.max(currentVerse - 1, 0);

        Speech.stop();
        speakVerses(verses, newIndex);
    };

    const stopSpeech = () => {
        Speech.stop();
        setIsSpeaking(false);
        setCurrentSpeakingVerse(null);
        setCurrentVerse(0);
        setIsPaused(false);
    };

    const startReading = () => {
        if (verses.length > 0) {
            speakVerses(verses, 0, true);
            setIsSpeaking(true);
            setIsPaused(false);
        }
    };

    const toggleSpeech = () => {
        if (isSpeaking) {
            stopSpeech();
        } else {
            startReading();
        }
    };

    const isLastChapter = chapterIndex >= typedBible[bookIndex].chapters.length - 1;
    const isLastBook = bookIndex >= typedBible.length - 1;
    const isFirstChapter = chapterIndex <= 0;
    const isFirstBook = bookIndex <= 0;

    // Create data array with verse numbers and text
    const versesData = verses.map((verse, index) => ({
        verse: verse,
        number: index + 1,
    }));

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colors.background,
            paddingTop: 20,
        },
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            paddingHorizontal: 1,
            borderBottomWidth: 1,
            borderBottomColor: colors.icon,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            flex: 1,
            textAlign: 'center',
        },
        backButton: {
            padding: 8,
            position: 'absolute',
            left: 16,
            zIndex: 1,
        },
        backButtonText: {
            color: colors.tint,
            fontSize: 16,
        },
        headerText: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            textAlign: 'center',
            padding: 16,
        },
        verseContainer: {
            padding: 16,
        },
        verseWrapper: {
            flexDirection: 'row',
            marginBottom: 16,
        },
        verseNumber: {
            fontSize: 14,
            fontWeight: 'bold',
            color: colors.tint,
            marginRight: 8,
            width: 24,
            textAlign: 'right',
        },
        verseText: {
            fontSize: 18,
            color: colors.text,
            flex: 1,
            lineHeight: 26,
        },
        navigationButtonsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 30,
            marginBottom: 40,
            paddingHorizontal: 10,
        },
        navigationButton: {
            backgroundColor: colors.tint + '20',
            padding: 14,
            borderRadius: 8,
            minWidth: 130,
            alignItems: 'center',
        },
        navigationButtonText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '500',
        },
        disabledButton: {
            backgroundColor: colors.icon + '40',
            opacity: 0.5,
        },
        speakingVerse: {
            backgroundColor: colors.tint + '20',
        },
        controlsContainer: {
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: colors.background,
            borderRadius: 25,
            padding: 12,
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            marginHorizontal: 20,
        },
        controlButton: {
            padding: 10,
        },
        headerButton: {
            padding: 8,
            position: 'absolute',
            right: 16,
        },
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" backgroundColor="#141414" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Holy Bible</Text>
                    {!isSpeaking && (
                        <TouchableOpacity onPress={toggleSpeech} style={styles.headerButton}>
                            <Ionicons
                                name="play"
                                size={24}
                                color={colors.tint}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.container}>
                    <Text style={styles.headerText}>{bookName} {chapterIndex + 1}</Text>
                    <FlatList
                        ref={flatListRef}
                        data={versesData}
                        renderItem={({ item, index }) => (
                            <View style={[
                                styles.verseWrapper,
                                currentSpeakingVerse === index && styles.speakingVerse
                            ]}>
                                <Text style={styles.verseNumber}>{item.number}</Text>
                                <Text style={styles.verseText}>{item.verse}</Text>
                            </View>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={styles.verseContainer}
                        ListFooterComponent={() => (
                            <View style={styles.navigationButtonsContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.navigationButton,
                                        (isFirstChapter && isFirstBook) ? styles.disabledButton : {}
                                    ]}
                                    onPress={handlePreviousChapter}
                                    disabled={isFirstChapter && isFirstBook}
                                >
                                    <Text style={styles.navigationButtonText}>
                                        {isFirstChapter && !isFirstBook ?
                                            `← ${typedBible[bookIndex - 1].name || typedBible[bookIndex - 1].abbrev}` :
                                            '← Previous'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.navigationButton,
                                        (isLastChapter && isLastBook) ? styles.disabledButton : {}
                                    ]}
                                    onPress={handleNextChapter}
                                    disabled={isLastChapter && isLastBook}
                                >
                                    <Text style={styles.navigationButtonText}>
                                        {isLastChapter && !isLastBook ?
                                            `${typedBible[bookIndex + 1].name || typedBible[bookIndex + 1].abbrev} →` :
                                            'Next →'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        initialScrollIndex={initialVerseIndex !== null ? initialVerseIndex : 0}
                        onScrollToIndexFailed={info => {
                            const wait = new Promise(resolve => setTimeout(resolve, 500));
                            wait.then(() => {
                                flatListRef.current?.scrollToIndex({
                                    index: info.index,
                                    animated: true,
                                    viewPosition: 0.5
                                });
                            });
                        }}
                    />
                </View>

                {/* Reading Controls */}
                {isSpeaking && (
                    <View style={styles.controlsContainer}>
                        <TouchableOpacity onPress={() => moveToVerse('prev')} style={styles.controlButton}>
                            <Ionicons name="play-skip-back" size={24} color={colors.tint} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={restartSpeech} style={styles.controlButton}>
                            <Ionicons name="refresh" size={24} color={colors.tint} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={togglePause} style={styles.controlButton}>
                            <Ionicons name={isPaused ? "play" : "pause"} size={24} color={colors.tint} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={stopSpeech} style={styles.controlButton}>
                            <Ionicons name="stop" size={24} color={colors.tint} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => moveToVerse('next')} style={styles.controlButton}>
                            <Ionicons name="play-skip-forward" size={24} color={colors.tint} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

export default ChapterVerses;
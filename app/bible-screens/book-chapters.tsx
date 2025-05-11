import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, StatusBar } from 'react-native';
import { useLocalSearchParams, Link, useRouter, Stack } from 'expo-router';
import bible from "@/assets/bible/en_kjv.json";
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AdBanner from '@/components/AdBanner';

const BookChapters = () => {
    const params = useLocalSearchParams();
    const bookIndex = Number(params.book);
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme];
    const router = useRouter();

    // State declarations
    const [bookName, setBookName] = useState<string>('');
    const [chapterCount, setChapterCount] = useState<number>(0);

    // Type assertion for Bible structure
    const typedBible = bible as Array<{
        abbrev: string,
        name?: string,
        chapters: string[][]
    }>;

    // Get book name and chapter count on component mount
    useEffect(() => {
        if (bookIndex >= 0 && bookIndex < typedBible.length) {
            const book = typedBible[bookIndex];
            setBookName(book.name || book.abbrev || `Book ${bookIndex + 1}`);
            setChapterCount(book.chapters.length);
        }
    }, [bookIndex]);

    const handleBack = () => {
        router.back();
    };

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
        chapterGrid: {
            padding: 16,
            alignItems: 'center',
        },
        chapterItem: {
            width: '22%',
            aspectRatio: 1,
            justifyContent: 'center',
            alignItems: 'center',
            margin: '1.5%',
            backgroundColor: colors.tint + '20', // Using tint color with 20% opacity
            borderRadius: 8,
        },
        chapterText: {
            fontSize: 18,
            color: colors.text,
        },
    });

    const renderChapters = () => {
        return (
            <View style={styles.container}>
                <Text style={styles.headerText}>{bookName}</Text>
                <FlatList
                    data={Array.from({ length: chapterCount }, (_, i) => i + 1)}
                    renderItem={({ item, index }) => (
                        <Link
                            href={{
                                pathname: '/bible-screens/chapter-verses',
                                params: { book: bookIndex, chapter: index }
                            }}
                            asChild
                        >
                            <TouchableOpacity style={styles.chapterItem}>
                                <Text style={styles.chapterText}>{item}</Text>
                            </TouchableOpacity>
                        </Link>
                    )}
                    keyExtractor={(item) => item.toString()}
                    numColumns={4}
                    contentContainerStyle={styles.chapterGrid}
                />
            </View>
        );
    };

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
                </View>
                {renderChapters()}
                <AdBanner />
            </View>
        </SafeAreaView>
    );
};

export default BookChapters;
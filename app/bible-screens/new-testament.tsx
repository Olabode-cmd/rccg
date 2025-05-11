import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, StatusBar } from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import bible from "@/assets/bible/en_kjv.json";
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AdBanner from '@/components/AdBanner';

const NewTestament = () => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme];
    const router = useRouter();

    // Define New Testament book indices (39-65)
    const NEW_TESTAMENT_BOOKS = Array.from({ length: 27 }, (_, i) => i + 39);

    // State declarations
    const [bookNames, setBookNames] = useState<string[]>([]);

    // Type assertion for Bible structure
    const typedBible = bible as Array<{
        abbrev: string,
        name?: string,
        chapters: string[][]
    }>;

    // Get book names on component mount
    useEffect(() => {
        const newTestamentBooks = getTestamentBooks();
        setBookNames(newTestamentBooks);
    }, []);

    // Get book names for New Testament
    const getTestamentBooks = () => {
        return NEW_TESTAMENT_BOOKS.map(index => {
            const book = typedBible[index];
            return book.name || book.abbrev || `Book ${index + 1}`;
        });
    };

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
        list: {
            paddingVertical: 8,
            paddingHorizontal: 16,
        },
        item: {
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.icon,
        },
        itemText: {
            fontSize: 18,
            color: colors.text,
        },
        testamentTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginTop: 24,
            marginBottom: 8,
            paddingHorizontal: 20,
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
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={styles.testamentTitle}>New Testament</Text>
                    <FlatList
                        data={bookNames}
                        renderItem={({ item, index }) => (
                            <Link
                                href={{
                                    pathname: '/bible-screens/book-chapters',
                                    params: { book: NEW_TESTAMENT_BOOKS[index] }
                                }}
                                asChild
                            >
                                <TouchableOpacity style={styles.item}>
                                    <Text style={styles.itemText}>{item}</Text>
                                </TouchableOpacity>
                            </Link>
                        )}
                        keyExtractor={(_, index) => index.toString()}
                        contentContainerStyle={styles.list}
                    />
                </View>
                <AdBanner />
            </View>
        </SafeAreaView>
    );
};

export default NewTestament;
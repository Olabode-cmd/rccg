import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Link } from 'expo-router';
import bible from "@/assets/bible/en_kjv.json";
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StatusBar } from 'expo-status-bar';

// Admob ads
// import AdBanner from '@/components/AdBanner';
const Bible = () => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme];

    // State declarations
    const [bookNames, setBookNames] = useState<string[]>([]);
    const [quickNavBook, setQuickNavBook] = useState<number>(0);
    const [quickNavChapter, setQuickNavChapter] = useState<number>(1);
    const [quickNavVerse, setQuickNavVerse] = useState<number>(1);

    // Type assertion for Bible structure
    const typedBible = bible as Array<{
        abbrev: string,
        name?: string,
        chapters: string[][]
    }>;

    // Get all book names on component mount
    useEffect(() => {
        const names = typedBible.map((book, index) => {
            return book.name || book.abbrev || `Book ${index + 1}`;
        });
        setBookNames(names);
    }, []);

    // Add helper function to get chapter count
    const getChapterCount = (bookIndex: number) => {
        return typedBible[bookIndex]?.chapters.length || 0;
    };

    // Add helper function to get verse count
    const getVerseCount = (bookIndex: number, chapterIndex: number) => {
        return typedBible[bookIndex]?.chapters[chapterIndex]?.length || 0;
    };

    // Quick Navigation component
    const QuickNavigation = () => {
        const [quickNavBook, setQuickNavBook] = useState(0);
        const [quickNavChapter, setQuickNavChapter] = useState(1);
        const [quickNavVerse, setQuickNavVerse] = useState(1);

        const chapterCount = getChapterCount(quickNavBook);
        const verseCount = getVerseCount(quickNavBook, quickNavChapter - 1);

        return (
            <View style={styles.quickNavContainer}>
                <Text style={styles.quickNavTitle}>Jump to verse</Text>

                <View style={{ marginBottom: 5}}>
                    <Text style={styles.selectLabel}>Book</Text>
                    
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={quickNavBook}
                            onValueChange={(itemValue: number) => {
                                setQuickNavBook(itemValue);
                                setQuickNavChapter(1);
                                setQuickNavVerse(1);
                            }}
                            style={styles.select}
                            itemStyle={styles.pickerItem}
                            dropdownIconColor={colors.text}
                        >
                            {bookNames.map((book, index) => (
                                <Picker.Item key={index} label={book} value={index} />
                            ))}
                        </Picker>
                    </View>
                </View>
                <View style={styles.quickNavRow}>
                    <View style={styles.selectContainer}>
                        <Text style={styles.selectLabel}>Chapter</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={quickNavChapter}
                                onValueChange={(itemValue: number) => {
                                    setQuickNavChapter(itemValue);
                                    setQuickNavVerse(1);
                                }}
                                style={styles.select}
                                itemStyle={styles.pickerItem}
                                dropdownIconColor={colors.text}
                            >
                                {Array.from({ length: chapterCount }, (_, i) => i + 1).map((num) => (
                                    <Picker.Item key={num} label={num.toString()} value={num} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.selectContainer}>
                        <Text style={styles.selectLabel}>Verse</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={quickNavVerse}
                                onValueChange={(itemValue: number) => setQuickNavVerse(itemValue)}
                                style={styles.select}
                                itemStyle={styles.pickerItem}
                                dropdownIconColor={colors.text}
                            >
                                {Array.from({ length: verseCount }, (_, i) => i + 1).map((num) => (
                                    <Picker.Item key={num} label={num.toString()} value={num} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                </View>

                <Link
                    href={`/bible-screens/chapter-verses?book=${quickNavBook}&chapter=${quickNavChapter - 1}&verse=${quickNavVerse - 1}`}
                    asChild
                >
                    <TouchableOpacity style={styles.goButton}>
                        <Text style={styles.goButtonText}>Go to Verse</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        );
    };

    // Render testament selection screen
    const renderTestamentSelection = () => {
        return (
            <View>
                <QuickNavigation />
                <Text style={styles.testamentTitle}>Testaments</Text>
                <Link href="/bible-screens/old-testament" asChild>
                    <TouchableOpacity style={styles.item}>
                        <Text style={styles.itemText}>Old Testament</Text>
                    </TouchableOpacity>
                </Link>
                <Link href="/bible-screens/new-testament" asChild>
                    <TouchableOpacity style={styles.item}>
                        <Text style={styles.itemText}>New Testament</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        );
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
        quickNavContainer: {
            backgroundColor: colors.background,
            padding: 16,
            marginBottom: 8,
            borderBottomWidth: 1,
            borderBottomColor: colors.icon + '40',
        },
        quickNavRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        selectContainer: {
            flex: 1,
            marginHorizontal: 4,
        },
        select: {
            backgroundColor: colors.tint + '10',
            borderRadius: 8,
            padding: 8,
            color: colors.text,
        },
        selectLabel: {
            color: colors.text,
            fontSize: 12,
            marginBottom: 4,
            opacity: 0.7,
        },
        goButton: {
            backgroundColor: colors.tint,
            borderRadius: 8,
            padding: 12,
            alignItems: 'center',
            marginTop: 8,
        },
        goButtonText: {
            color: '#FFFFFF',
            fontWeight: '600',
        },
        quickNavTitle: {
            color: colors.text,
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 12,
            opacity: 0.8,
        },
        testamentTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginTop: 24,
            marginBottom: 8,
            paddingHorizontal: 20,
        },
        pickerWrapper: {
            backgroundColor: colors.tint + '10',
            borderRadius: 8,
            overflow: 'hidden',
        },
        pickerItem: {
            color: colors.text,
            fontSize: 14,
        },
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Holy Bible</Text>
                </View>
                {renderTestamentSelection()}
            </View>
            {/* <AdBanner /> */}
        </SafeAreaView>
    );
};

export default Bible;
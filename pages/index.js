import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import { getRequestCounts } from '../lib/db';
import { allEndpoints } from '../lib/endpoints'; // ✅ import daftar endpoint
import Image from 'next/image';
import { useRef } from 'react';

export async function getStaticProps() {
    const stats = await getRequestCounts(); 
    const totalEndpoints = allEndpoints.length; // ✅ hitung jumlah endpoint

    return {
        props: { stats, totalEndpoints }, // ✅ kirim ke props
        revalidate: 10
    };
}

export default function Home({ stats, totalEndpoints }) { // ✅ terima props
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cardRef.current.style.setProperty('--mouse-x', `${x}px`);
        cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>HIRAKO - API | Welcome</title>
            </Head>

            <div className={styles.content}>
                <h1 className={`${styles.title} shiny-text`}>HIRAKO - API</h1>
                <p className={styles.description}>
                    Simple, fast, and elegant REST API for a variety of needs.
                    平子
                </p>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <h3>{new Intl.NumberFormat().format(stats.total_requests)}</h3>
                        <p>Total Requests</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>{new Intl.NumberFormat().format(stats.today_requests)}</h3>
                        <p>Requests Today</p>
                    </div>
                    <div className={styles.statCard}> {/* ✅ Tambahan kotak */}
                        <h3>{new Intl.NumberFormat().format(totalEndpoints)}</h3>
                        <p>Endpoints Available</p>
                    </div>
                </div>

                <Link href="/docs" legacyBehavior>
                    <a className={styles.exploreButton}>Explore Documentation</a>
                </Link>
                
                <h2 className={styles.thanksTitle}>Thanks To</h2>

                <div 
                    className={styles.creatorCard}
                    ref={cardRef}
                    onMouseMove={handleMouseMove}
                >
                    <div className={styles.creatorCardContent}>
                        <div className={styles.creatorAvatarWrapper}>
                            <Image 
                                src="/profile.png"
                                alt="Hirako"
                                width={80}
                                height={80}
                                className={styles.creatorAvatar}
                            />
                        </div>
                        <h2 className={styles.creatorName}>Hirako</h2>
                        <p className={styles.creatorRole}>Prompt Engineer</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
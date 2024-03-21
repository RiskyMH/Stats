/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/utils/tw";


export interface Option {
    name: string;
    value: number | bigint;
    valueName: string;
    image: string | null;
    link: string;
    lastModified?: Date;
    higherButton?: string;
    lowerButton?: string
}


export default function HigherOrLowerPage({ fetchOptions, initialOptions }: { fetchOptions: () => Promise<Option[]>, initialOptions: Option[] }) {
    const [score, setScore] = useState(0);
    const [failed, setFailed] = useState(false);
    const [index, setIndex] = useState(0);
    const [options, setOptions] = useState<Option[]>(initialOptions);

    // should fetch when 5 rounds are to go until run out of original videos 
    const shouldFetch = index >= (options.length - 5);

    useEffect(() => {
        if (!shouldFetch) return;

        (async () => {
            const options = await fetchOptions()
            setOptions(o => [...o, ...options])
        })()
    }, [shouldFetch, fetchOptions])


    useEffect(() => {
        // every index change, prefetch next 2 videos images
        [options[index + 2], options[index + 3]]
            .map((vid) => {
                if (!vid) return;
                const image = new Image()
                image.src = vid.image!
            })
    }, [index, options, failed])

    return (
        <div className="h-screen w-screen text-centre m-0 ease-in-out text-white bg-black overflow-x-hidden" style={failed ? { animation: "1s ease 0s 1 normal none running shakeX" } : undefined}>
            {/* score at bottom */}
            <div className="flex p-2 absolute bottom-1 items-center justify-center w-full">
                <h3 className="font-bold text-white text-2xl text-center z-50">Score: {score}</h3>
            </div>

            {options?.length && options[index] ? (
                <>
                    {/* "vs" icon in center */}
                    <div className="w-[100px] h-[100px] rounded-full text-black bg-white absolute -translate-x-1/2 -translate-y-3/4 sm:-translate-y-1/2 z-40 top-1/2 left-1/2 flex">
                        <span className={cn("text-center self-center m-auto text-3xl sm:text-4xl font-bold", failed && "text-red-500")}>
                            {failed ? "X" : "VS"}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row h-screen w-screen">
                        {/* left option */}
                        <Side position="left" option={options[index]!} index={index} />

                        {/* right option */}
                        {options[index + 1] ? (
                            <Side position="right" option={options[index + 1]!} otherValue={options[index].value} failed={failed} setScore={setScore} setFailed={setFailed} setIndex={setIndex} index={index} />
                        ) : (
                            // @ts-expect-error im scamming
                            <Side position="right" option={{ name: "Loading..." }} />
                        )}
                    </div>

                    {failed && (
                        <>
                            <h2 className="text-6xl font-extrabold left-1/2 top-1/4 sm:top-1/4 absolute -translate-x-1/2 -translate-y-2/3 sm:-translate-y-1/2 text-center z-50 rounded-lg p-2 bg-black/75 sm:bg-transparent">Game Over!</h2>
                            <HigherOrLowerButton
                                className="z-50 left-1/2 bottom-3 sm:top-3/4 absolute -translate-x-1/2 -translate-y-1/2 h-[70px] w-[200px] sm:w-[200px] text-2xl bg-black/30"
                                onClick={() => {
                                    setFailed(false)
                                    setScore(0)
                                    setOptions((o) => o.filter((_, i) => (i - 2) >= index))
                                    setIndex(0)
                                }}
                            >
                                Play Again
                            </HigherOrLowerButton>
                        </>
                    )}
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>

    )
}

type SideProps = {
    option: Option;
    otherValue?: number | bigint;
    failed?: boolean;
    setScore?: (value: React.SetStateAction<number>) => void;
    setFailed?: (value: React.SetStateAction<boolean>) => void;
    setIndex?: (value: React.SetStateAction<number>) => void;
    position: 'left' | 'right';
    index: number
};

function Side({ option, otherValue, failed, setScore, setFailed, setIndex, position, index }: SideProps) {
    const isLeft = position === 'left';

    return (
        <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center overflow-hidden">
            <OptionImage src={option.image} key={option.image} alt={option.name} className={isLeft ? 'float-top sm:left' : 'float-bottom sm:right'} />

            <h3 className="text-2xl sm:text-4xl z-10 font-bold">“{option.name}”</h3>
            <span className="text-xl sm:text-2xl font-semibold block my-2 z-10">
                has
            </span>
            {isLeft || failed ? (
                <>
                    <span className="mt-4 text-4xl sm:text-6xl text-[#ff0] font-bold block z-10">
                        {option.value.toLocaleString()}
                    </span>
                    <span className="text-2xl sm:text-3xl font-semibold block z-10">
                        {option.valueName}
                    </span>
                </>
            ) : null}

            {!isLeft && !failed && (option.value !== undefined) && (
                <div className="z-10">
                    <HigherOrLowerButton
                        onClick={() => {
                            if (option.value >= otherValue!) {
                                setScore!(s => s + 1)
                                setFailed!(false)
                                setIndex!(i => i + 1)
                            } else {
                                setFailed!(true)
                            }
                        }}
                        className="group text-[#ff0] hover:text-black bg-black/30"
                    >
                        {option.higherButton || "Higher"}
                        <Arrow className="fill-white group-hover:fill-black rotate-180 self-center h-8" />
                    </HigherOrLowerButton>

                    <HigherOrLowerButton
                        onClick={() => {
                            if (option.value <= otherValue!) {
                                setScore!(s => s + 1)
                                setFailed!(false)
                                setIndex!(i => i + 1)
                            } else {
                                setFailed!(true)
                            }
                        }}
                        className="group text-[#ff0] hover:text-black bg-black/30"
                    >
                        {option.lowerButton || "Lower"}
                        <Arrow className="fill-white group-hover:fill-black self-center h-8" />
                    </HigherOrLowerButton>
                </div>
            )}

            <LastModified link={option.link} lastModified={option.lastModified} className={`${isLeft ? 'left-0' : 'right-0'} `} />
        </div>
    );
}

function OptionImage({ src, alt, className }: { src?: string | null, alt?: string, className?: string }) {
    if (!src) return null

    return (
        <img src={src} alt={alt} className={cn("absolute h-1/2 sm:h-screen object-cover w-screen sm:w-1/2 overflow-hidden opacity-40", className)} />
    )
}

function LastModified({ link, className, lastModified }: { link: string, className: string, lastModified?: Date }) {

    return (
        <a className={cn("hidden sm:block absolute bottom-0 text-xs text-gray-400 z-10 m-3 hover:underline", className)} href={link} rel="noopener noreferrer" target="_blank">
            {lastModified? `As of ${lastModified.toLocaleDateString()}`: "Source"}
        </a>
    )
}

function HigherOrLowerButton({ children, onClick, className }: { children: ReactNode, onClick: () => any, className?: string }) {
    return (
        <button
            className={cn("flex gap-2 items-center text-center font-bold justify-center text-xl sm:text-2xl py-[0.6em] px-[1.2em] ml-auto mr-auto w-[80vw] sm:w-[20vw] mt-5 rounded-[50px] bg-black/10 border-white border-2 text-white hover:bg-white hover:text-black transition-all ease-in", className)}
            onClick={onClick}
        >
            {children}
        </button>
    )
}

export function Arrow({ className }: { className?: string }) {
    return (
        <svg
            stroke="currentColor"
            fill="currentColor"
            className={className}
            strokeWidth="0"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M128 192l128 128 128-128z" />
        </svg>
    )
}
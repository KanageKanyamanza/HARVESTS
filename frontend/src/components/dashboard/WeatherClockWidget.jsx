import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Sun,
	Cloud,
	CloudRain,
	CloudSnow,
	CloudLightning,
	CloudFog,
	CloudDrizzle,
	Droplets,
	Wind,
} from "lucide-react";

// Coordonnées par défaut : Dakar, Sénégal
const DEFAULT_COORDS = { latitude: 14.6928, longitude: -17.4467 };
const DEFAULT_CITY = "Dakar";

// Mappe les codes météo WMO (Open-Meteo) vers icône + clé de libellé i18n
const getWeatherInfo = (code) => {
	if (code === 0) return { labelKey: "clearSky", Icon: Sun, color: "text-amber-500" };
	if ([1, 2].includes(code)) return { labelKey: "mostlyClear", Icon: Sun, color: "text-amber-400" };
	if (code === 3) return { labelKey: "cloudy", Icon: Cloud, color: "text-gray-400" };
	if ([45, 48].includes(code)) return { labelKey: "foggy", Icon: CloudFog, color: "text-gray-400" };
	if ([51, 53, 55, 56, 57].includes(code)) return { labelKey: "drizzle", Icon: CloudDrizzle, color: "text-sky-500" };
	if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { labelKey: "rain", Icon: CloudRain, color: "text-sky-600" };
	if ([71, 73, 75, 77, 85, 86].includes(code)) return { labelKey: "snow", Icon: CloudSnow, color: "text-sky-300" };
	if ([95, 96, 99].includes(code)) return { labelKey: "thunderstorm", Icon: CloudLightning, color: "text-purple-500" };
	return { labelKey: "sunny", Icon: Sun, color: "text-amber-500" };
};

const WeatherClockWidget = ({ city }) => {
	const { t, i18n } = useTranslation("navigation");
	const [now, setNow] = useState(new Date());
	const [weather, setWeather] = useState(null);
	const [weatherError, setWeatherError] = useState(false);
	// true seulement quand la géolocalisation navigateur a résolu une position
	// sans nom de ville fourni en prop — permet de calculer le libellé au
	// rendu (donc réactif à un changement de langue) plutôt que de figer une
	// chaîne traduite dans le state au moment de la résolution.
	const [usingGeolocation, setUsingGeolocation] = useState(false);
	const locationLabel = city || (usingGeolocation ? t("topbar.yourLocation", "Votre position") : DEFAULT_CITY);

	// Horloge en direct
	useEffect(() => {
		const timer = setInterval(() => setNow(new Date()), 1000 * 30);
		return () => clearInterval(timer);
	}, []);

	// Récupération météo (géolocalisation navigateur, sinon Dakar par défaut)
	useEffect(() => {
		let cancelled = false;

		const fetchWeather = async (latitude, longitude) => {
			try {
				const res = await fetch(
					`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
				);
				if (!res.ok) throw new Error("Échec météo");
				const data = await res.json();
				if (!cancelled && data?.current) {
					setWeather({
						temperature: Math.round(data.current.temperature_2m),
						humidity: Math.round(data.current.relative_humidity_2m),
						windSpeed: Math.round(data.current.wind_speed_10m),
						code: data.current.weather_code,
					});
				}
			} catch {
				if (!cancelled) setWeatherError(true);
			}
		};

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					fetchWeather(pos.coords.latitude, pos.coords.longitude);
					if (!city) setUsingGeolocation(true);
				},
				() => {
					fetchWeather(DEFAULT_COORDS.latitude, DEFAULT_COORDS.longitude);
				},
				{ timeout: 6000, maximumAge: 15 * 60 * 1000 }
			);
		} else {
			fetchWeather(DEFAULT_COORDS.latitude, DEFAULT_COORDS.longitude);
		}

		return () => {
			cancelled = true;
		};
	}, [city]);

	const dateLocale = i18n.language === "en" ? "en-US" : "fr-FR";
	const timeLabel = now.toLocaleTimeString(dateLocale, {
		hour: "2-digit",
		minute: "2-digit",
	});
	const dateLabel = now.toLocaleDateString(dateLocale, {
		weekday: "short",
		day: "numeric",
		month: "short",
	});

	const { Icon, color, labelKey } = weather
		? getWeatherInfo(weather.code)
		: { Icon: Sun, color: "text-gray-300", labelKey: null };
	const label = labelKey ? t(`topbar.weather.${labelKey}`) : "";

	return (
		<>
			{/* Version compacte (mobile) : icône météo + température seulement */}
			<div className="flex md:hidden items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 border border-gray-100 text-gray-700">
				<Icon className={`h-4 w-4 flex-shrink-0 ${color}`} />
				<span className="text-xs font-bold tabular-nums">
					{weather ? `${weather.temperature}°` : "--°"}
				</span>
				<span className="w-px h-3 bg-gray-200 mx-0.5" />
				<span className="text-xs font-bold tabular-nums">{timeLabel}</span>
			</div>

			{/* Version complète (desktop) */}
			<div className="hidden md:flex items-center gap-4 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-700">
				{/* Horloge */}
				<div className="flex flex-col leading-tight">
					<span className="text-sm font-bold tabular-nums">{timeLabel}</span>
					<span className="text-[10px] text-gray-400 capitalize">{dateLabel}</span>
				</div>

				<div className="w-px h-8 bg-gray-200" />

				{/* Météo */}
				<div className="flex items-center gap-2">
					<Icon className={`h-5 w-5 flex-shrink-0 ${color}`} />
					<div className="flex flex-col leading-tight">
						{weather ? (
							<>
								<span className="text-sm font-bold tabular-nums">
									{weather.temperature}°C
								</span>
								<span className="text-[10px] text-gray-400">
									{locationLabel} · {label}
								</span>
							</>
						) : weatherError ? (
							<span className="text-[11px] text-gray-400">{t("topbar.weatherUnavailable", "Météo indisponible")}</span>
						) : (
							<span className="text-[11px] text-gray-400">{t("topbar.weatherLoading", "Chargement météo…")}</span>
						)}
					</div>
				</div>

				{weather && (
					<>
						<div className="w-px h-8 bg-gray-200" />
						<div className="hidden lg:flex items-center gap-3 text-[11px] text-gray-400">
							<span className="flex items-center gap-1">
								<Droplets className="h-3.5 w-3.5 text-sky-400" />
								{weather.humidity}%
							</span>
							<span className="flex items-center gap-1">
								<Wind className="h-3.5 w-3.5 text-gray-400" />
								{weather.windSpeed} km/h
							</span>
						</div>
					</>
				)}
			</div>
		</>
	);
};

export default WeatherClockWidget;

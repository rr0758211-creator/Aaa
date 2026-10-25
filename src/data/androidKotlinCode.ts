export interface AndroidFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const ANDROID_KOTLIN_FILES: AndroidFile[] = [
  {
    name: 'MainActivity.kt',
    path: 'app/src/main/java/com/depth/wallpaper/MainActivity.kt',
    language: 'kotlin',
    description: 'Main Android Activity with Material 3 Dark Theme, Jetpack Compose Navigation & Edge-to-Edge display.',
    content: `package com.depth.wallpaper

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.*
import com.depth.wallpaper.ui.screens.*
import com.depth.wallpaper.ui.theme.DepthWallpaperTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            DepthWallpaperTheme(darkTheme = true) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    DepthWallpaperApp()
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DepthWallpaperApp(
    viewModel: WallpaperViewModel = viewModel()
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination?.route

    Scaffold(
        bottomBar = {
            if (currentDestination != "detail/{wallpaperId}") {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                ) {
                    val favoritesCount by viewModel.favoritesCount.collectAsState(initial = 0)

                    NavigationBarItem(
                        icon = { 
                            Icon(
                                if (currentDestination == "explore") Icons.Filled.Home else Icons.Outlined.Home,
                                contentDescription = "Explore"
                            )
                        },
                        label = { Text("Explore") },
                        selected = currentDestination == "explore",
                        onClick = {
                            navController.navigate("explore") {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                    NavigationBarItem(
                        icon = {
                            BadgedBox(
                                badge = {
                                    if (favoritesCount > 0) {
                                        Badge { Text(favoritesCount.toString()) }
                                    }
                                }
                            ) {
                                Icon(
                                    if (currentDestination == "favorites") Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                                    contentDescription = "Favorites"
                                )
                            }
                        },
                        label = { Text("Favorites") },
                        selected = currentDestination == "favorites",
                        onClick = {
                            navController.navigate("favorites") {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "explore",
            modifier = Modifier.padding(innerPadding)
        ) {
            composable("explore") {
                ExploreScreen(
                    viewModel = viewModel,
                    onWallpaperClick = { wallpaper ->
                        viewModel.setSelectedWallpaper(wallpaper)
                        navController.navigate("detail/\${wallpaper.id}")
                    }
                )
            }
            composable("favorites") {
                FavoritesScreen(
                    viewModel = viewModel,
                    onWallpaperClick = { wallpaper ->
                        viewModel.setSelectedWallpaper(wallpaper)
                        navController.navigate("detail/\${wallpaper.id}")
                    }
                )
            }
            composable("detail/{wallpaperId}") {
                DetailScreen(
                    viewModel = viewModel,
                    onBackClick = { navController.popBackStack() }
                )
            }
        }
    }
}
`,
  },
  {
    name: 'WallhavenApi.kt',
    path: 'app/src/main/java/com/depth/wallpaper/data/api/WallhavenApi.kt',
    language: 'kotlin',
    description: 'Retrofit interface querying Wallhaven API with strict SFW (purity=100) and Anime (categories=010) portrait filters.',
    content: `package com.depth.wallpaper.data.api

import com.depth.wallpaper.data.model.WallhavenResponse
import retrofit2.http.GET
import retrofit2.http.Query

interface WallhavenApi {
    /**
     * Search anime boys wallpapers on Wallhaven:
     * - q: +"anime boys" -"anime girls" (plus user keyword if specified)
     * - categories: 010 (anime only)
     * - purity: 100 (SFW only, never allow NSFW)
     * - ratios: portrait
     */
    @GET("api/v1/search")
    suspend fun getAnimeWallpapers(
        @Query("categories") categories: String = "010",
        @Query("purity") purity: String = "100",
        @Query("ratios") ratios: String = "portrait",
        @Query("q") query: String = """+"anime boys" -"anime girls"""",
        @Query("page") page: Int = 1
    ): WallhavenResponse

    companion object {
        const val BASE_URL = "https://wallhaven.cc/"
        const val BASE_ANIME_BOYS_QUERY = """+"anime boys" -"anime girls""""
    }
}
`,
  },
  {
    name: 'WallpaperModels.kt',
    path: 'app/src/main/java/com/depth/wallpaper/data/model/WallpaperModels.kt',
    language: 'kotlin',
    description: 'Data models for Wallhaven JSON: large thumbnail for 2-column grid and path for full-size preview.',
    content: `package com.depth.wallpaper.data.model

import com.google.gson.annotations.SerializedName

data class WallhavenResponse(
    @SerializedName("data") val data: List<WallpaperDto>,
    @SerializedName("meta") val meta: MetaDto
)

data class WallpaperDto(
    @SerializedName("id") val id: String,
    @SerializedName("url") val url: String,
    @SerializedName("views") val views: Long,
    @SerializedName("favorites") val favorites: Long,
    @SerializedName("source") val source: String,
    @SerializedName("purity") val purity: String,
    @SerializedName("category") val category: String,
    @SerializedName("dimension_x") val dimensionX: Int,
    @SerializedName("dimension_y") val dimensionY: Int,
    @SerializedName("resolution") val resolution: String,
    @SerializedName("ratio") val ratio: String,
    @SerializedName("file_size") val fileSize: Long,
    @SerializedName("file_type") val fileType: String,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("colors") val colors: List<String>,
    @SerializedName("path") val path: String, // Full-size image path
    @SerializedName("thumbs") val thumbs: ThumbsDto // Large thumbnail for grid
)

data class ThumbsDto(
    @SerializedName("large") val large: String,
    @SerializedName("original") val original: String,
    @SerializedName("small") val small: String
)

data class MetaDto(
    @SerializedName("current_page") val currentPage: Int,
    @SerializedName("last_page") val lastPage: Int,
    @SerializedName("per_page") val perPage: Int,
    @SerializedName("total") val total: Int
)
`,
  },
  {
    name: 'WallpaperEntity.kt',
    path: 'app/src/main/java/com/depth/wallpaper/data/local/WallpaperEntity.kt',
    language: 'kotlin',
    description: 'Room Database Entity & DAO for local favorites storage that persists after app closes.',
    content: `package com.depth.wallpaper.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "favorites")
data class WallpaperEntity(
    @PrimaryKey val id: String,
    val thumbLarge: String,
    val fullPath: String,
    val resolution: String,
    val ratio: String,
    val fileSize: Long,
    val savedAt: Long = System.currentTimeMillis()
)

@Dao
interface WallpaperDao {
    @Query("SELECT * FROM favorites ORDER BY savedAt DESC")
    fun getAllFavorites(): Flow<List<WallpaperEntity>>

    @Query("SELECT EXISTS(SELECT 1 FROM favorites WHERE id = :id)")
    fun isFavorite(id: String): Flow<Boolean>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFavorite(wallpaper: WallpaperEntity)

    @Query("DELETE FROM favorites WHERE id = :id")
    suspend fun deleteFavorite(id: String)
}

@Database(entities = [WallpaperEntity::class], version = 1, exportSchema = false)
abstract class WallpaperDatabase : RoomDatabase() {
    abstract fun wallpaperDao(): WallpaperDao
}
`,
  },
  {
    name: 'WallpaperRepository.kt',
    path: 'app/src/main/java/com/depth/wallpaper/data/repository/WallpaperRepository.kt',
    language: 'kotlin',
    description: 'Repository combining Wallhaven API pagination and Room DAO favorites with Coil ImageLoader configuration.',
    content: `package com.depth.wallpaper.data.repository

import android.content.Context
import coil.ImageLoader
import coil.disk.DiskCache
import coil.memory.MemoryCache
import com.depth.wallpaper.data.api.WallhavenApi
import com.depth.wallpaper.data.local.WallpaperDao
import com.depth.wallpaper.data.local.WallpaperEntity
import com.depth.wallpaper.data.model.WallpaperDto
import kotlinx.coroutines.flow.Flow

class WallpaperRepository(
    private val api: WallhavenApi,
    private val dao: WallpaperDao,
    private val context: Context
) {
    // Coil ImageLoader configuration with Memory & Disk caching
    val imageLoader = ImageLoader.Builder(context)
        .memoryCache {
            MemoryCache.Builder(context)
                .maxSizePercent(0.25)
                .build()
        }
        .diskCache {
            DiskCache.Builder()
                .directory(context.cacheDir.resolve("coil_wallpapers"))
                .maxSizePercent(0.05)
                .build()
        }
        .crossfade(true)
        .build()

    suspend fun getWallpapers(page: Int, query: String? = null): WallhavenResponse {
        val baseQuery = WallhavenApi.BASE_ANIME_BOYS_QUERY
        val fullQuery = if (query.isNullOrBlank()) baseQuery else "\$baseQuery \${query.trim()}"
        return api.getAnimeWallpapers(
            categories = "010", // Anime
            purity = "100",     // SFW strictly enforced
            ratios = "portrait",
            query = fullQuery,
            page = page
        )
    }

    val favorites: Flow<List<WallpaperEntity>> = dao.getAllFavorites()

    fun isFavorite(id: String): Flow<Boolean> = dao.isFavorite(id)

    suspend fun toggleFavorite(wallpaper: WallpaperDto, isFav: Boolean) {
        if (isFav) {
            dao.deleteFavorite(wallpaper.id)
        } else {
            dao.insertFavorite(
                WallpaperEntity(
                    id = wallpaper.id,
                    thumbLarge = wallpaper.thumbs.large,
                    fullPath = wallpaper.path,
                    resolution = wallpaper.resolution,
                    ratio = wallpaper.ratio,
                    fileSize = wallpaper.fileSize
                )
            )
        }
    }
}
`,
  },
  {
    name: 'ExploreScreen.kt',
    path: 'app/src/main/java/com/depth/wallpaper/ui/screens/ExploreScreen.kt',
    language: 'kotlin',
    description: '2-Column LazyVerticalGrid with Coil AsyncImage, SearchBar, Infinite Scroll pagination & Retry error state.',
    content: `package com.depth.wallpaper.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.depth.wallpaper.data.model.WallpaperDto

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExploreScreen(
    viewModel: WallpaperViewModel,
    onWallpaperClick: (WallpaperDto) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val gridState = rememberLazyGridState()

    // Detect when user scrolls near bottom to load next page automatically
    val shouldLoadMore by remember {
        derivedStateOf {
            val totalItems = gridState.layoutInfo.totalItemsCount
            val lastVisibleIndex = gridState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
            totalItems > 0 && lastVisibleIndex >= totalItems - 4
        }
    }

    LaunchedEffect(shouldLoadMore) {
        if (shouldLoadMore && !uiState.isLoadingNextPage && !uiState.isLastPage) {
            viewModel.loadNextPage()
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        // Material 3 Search Bar
        SearchBar(
            query = uiState.searchQuery,
            onQueryChange = { viewModel.onSearchQueryChange(it) },
            onSearch = { viewModel.performSearch() },
            active = false,
            onActiveChange = {},
            placeholder = { Text("Search anime boys (e.g. naruto, gojo)...") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search") },
            trailingIcon = {
                if (uiState.searchQuery.isNotEmpty()) {
                    IconButton(onClick = { viewModel.clearSearch() }) {
                        Icon(Icons.Default.Close, contentDescription = "Clear")
                    }
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {}

        // Credit to Wallhaven & Anime Boys Query Tag
        Text(
            text = "Wallpapers from Wallhaven • Anime Boys SFW (+\"anime boys\" -\"anime girls\")",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
        )

        // Content States
        when {
            uiState.isLoading && uiState.wallpapers.isEmpty() -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }
            uiState.errorMessage != null && uiState.wallpapers.isEmpty() -> {
                Column(
                    modifier = Modifier.fillMaxSize().padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = uiState.errorMessage ?: "Failed to load wallpapers",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.error
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(onClick = { viewModel.retry() }) {
                        Icon(Icons.Default.Refresh, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Retry")
                    }
                }
            }
            else -> {
                // 2-Column Grid as required
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    state = gridState,
                    contentPadding = PaddingValues(8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(uiState.wallpapers, key = { it.id }) { wallpaper ->
                        WallpaperGridItem(
                            wallpaper = wallpaper,
                            onClick = { onWallpaperClick(wallpaper) }
                        )
                    }

                    if (uiState.isLoadingNextPage) {
                        item(span = { GridItemSpan(2) }) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                CircularProgressIndicator(modifier = Modifier.size(32.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun WallpaperGridItem(
    wallpaper: WallpaperDto,
    onClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(9f / 16f) // Portrait aspect ratio
            .clickable(onClick = onClick)
    ) {
        // Coil image caching using data[].thumbs.large
        AsyncImage(
            model = wallpaper.thumbs.large,
            contentDescription = "Anime Wallpaper \${wallpaper.id}",
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .fillMaxSize()
                .clip(RoundedCornerShape(12.dp))
        )
    }
}
`,
  },
  {
    name: 'DetailScreen.kt',
    path: 'app/src/main/java/com/depth/wallpaper/ui/screens/DetailScreen.kt',
    language: 'kotlin',
    description: 'Full-screen preview with data[].path, Download button to save image to gallery, and Heart toggle for favorites.',
    content: `package com.depth.wallpaper.ui.screens

import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import android.os.Environment
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.outlined.Download
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DetailScreen(
    viewModel: WallpaperViewModel,
    onBackClick: () -> Unit
) {
    val wallpaper = viewModel.selectedWallpaper ?: return
    val isFavorite by viewModel.isFavorite(wallpaper.id).collectAsState(initial = false)
    val context = LocalContext.current

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        // Full-size image loaded from data[].path with Coil
        AsyncImage(
            model = wallpaper.path,
            contentDescription = "Full Size Wallpaper",
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )

        // Top App Bar with back button
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 40.dp, start = 16.dp, end = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onBackClick,
                colors = IconButtonDefaults.iconButtonColors(containerColor = Color.Black.copy(alpha = 0.5f))
            ) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
        }

        // Bottom Action Bar
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.85f))
                    )
                )
                .padding(24.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Heart Button: Add / Remove Favorite
                FilledTonalIconButton(
                    onClick = { viewModel.toggleFavorite(wallpaper) },
                    colors = IconButtonDefaults.filledTonalIconButtonColors(
                        containerColor = if (isFavorite) MaterialTheme.colorScheme.errorContainer else Color.White.copy(alpha = 0.2f)
                    ),
                    modifier = Modifier.size(56.dp)
                ) {
                    Icon(
                        imageVector = if (isFavorite) Icons.Default.Favorite else Icons.Outlined.FavoriteBorder,
                        contentDescription = "Favorite",
                        tint = if (isFavorite) MaterialTheme.colorScheme.error else Color.White
                    )
                }

                // Download Button: Saves image to gallery
                Button(
                    onClick = {
                        downloadWallpaperToGallery(context, wallpaper.path, wallpaper.id)
                    },
                    modifier = Modifier.height(56.dp)
                ) {
                    Icon(Icons.Outlined.Download, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Download to Gallery")
                }
            }
        }
    }
}

fun downloadWallpaperToGallery(context: Context, url: String, id: String) {
    try {
        val request = DownloadManager.Request(Uri.parse(url))
            .setTitle("Depth Wallpaper \${id}")
            .setDescription("Saving full-size anime wallpaper to gallery...")
            .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            .setDestinationInExternalPublicDir(Environment.DIRECTORY_PICTURES, "DepthWallpaper_\${id}.jpg")
            .setAllowedOverMetered(true)
            .setAllowedOverRoaming(true)

        val dm = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        dm.enqueue(request)
        Toast.makeText(context, "Downloading wallpaper to Gallery...", Toast.LENGTH_SHORT).show()
    } catch (e: Exception) {
        Toast.makeText(context, "Download failed: \${e.message}", Toast.LENGTH_LONG).show()
    }
}
`,
  },
  {
    name: 'build.gradle.kts',
    path: 'app/build.gradle.kts',
    language: 'kotlin',
    description: 'Android Gradle build configuration with Jetpack Compose, Room, Coil, and Retrofit dependencies.',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.ksp)
}

android {
    namespace = "com.depth.wallpaper"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.depth.wallpaper"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures {
        compose = true
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.navigation.compose)

    // Coil Image Caching
    implementation("io.coil-kt:coil-compose:2.6.0")

    // Retrofit & Gson for Wallhaven API
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Room Database for local favorites
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    ksp("androidx.room:room-compiler:2.6.1")

    // Coroutines & Lifecycle
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.6")
}
`,
  },
];

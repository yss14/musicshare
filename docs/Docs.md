# Docs

## Libraries and Shares

### Library

A library is simply a personal music library, containing songs and playlists. Each registered user on a MusicShare instance owns a personal library. Other users are not able to upload songs to your personal library or see/create/edit/delete songs or playlists.

### Share

A share connects several libraries and makes all songs contained therein available as a song pool to all members of the share. Further, a share can own playlists and all share members with the respective permissions are able to create/edit/delete those playlists. Songs can not be uploaded to shares, you can only reference songs of the connected libraries in either share playlists or your personal library playlists.

For a share it is important to note, that as soon as a user becomes part of a share, all existing und future songs of the user library are available to all other share members in a read-only mode via either the `All` oder `Share` view.

**What happens if a referenced song is deleted by its owner?**
Since it is possible to reference other users songs within the boundaries of a share, the case may arise that a share member deletes a song which is referenced in either a share playlist or a personal library playlists. For share playlists, the referenced song simply is deleted from the playlists. For personal library playlists, the song becomes stale as soon as the owner of the song deletes it from their personal library. Here, stale means that the song is copied to your personal library without a file source. So you still have the possibility to either delete the song or upload a new file source of your own.

**What happens if a share member is leaving**?
If a share member leaves a share, this can be seen as like the member would delete all songs. So all song references of the leaving members library are removed from share playlists. Further, for all references in libraries of the other share members, the song is copied without file source to the corresponding libraries. The remaining share members then still have the possibility to either delete the song or upload a new file source of your own.

**What happens if a share member deletes their library**
Deleting a library is currently not supported. You can only leave other shares and remove all songs and playlists from your library.

**What happens if a share is deleted?**
Deleting a share is currently only possible if the share only contains one single member. If you want to close a share, kindly ask all members to the leave the share first, before you can finally delete it.

## Song View

At the moment, MusicShare offers 4 different kinds of song views.

### Library Songs

In the event of a fresh page visit, or when selecting your personal library from the `Shares` header navigation menu, all your libraries songs are shown in a big sorted list.

### Share Songs

When selecting a share from the `Shares` header navigation menu, an aggregated list of all connected libraries songs is displayed. Duplicates are possible, if two or more member independently own the same song.

### All Songs

Since MusicShare enables each user to be part of multiple shares at the same time, there is an aggregated songs view merging all songs from a shares a user is member of, accessible via the `All` header navigation menu entry. To get a better overview MusicShare indicates for each song from which share it is aggregated from.

### Playlist Songs

Both your personal library and shares can own playlists. To view a playlist, just click on the playlist name on the left side. In contrast to the other three kinds of songs view, the order of playlist songs is mutable and can be rearranged via simple drag'n'drop.

## Song Upload

As mentioned above, you can only upload songs to your personal library. Do so by either drag'n'drop `mp3` files into your browser window, or click the upload button located in the songs view header bar.

<p float="left">
<img src="https://musicshare-public.s3.eu-central-1.amazonaws.com/upload_dragndrop.png" width="400">
<img src="https://musicshare-public.s3.eu-central-1.amazonaws.com/upload_files_via_button.png" width="400">
</p>

Submitted files are then analyzed, checked for potential duplicates, and finally uploaded to the instances connected file storage. After a successful file upload, MusicShare tries to extract and analyze ID3 Tags the files name, to automatically recognize as much information as possible.

It is important to note, that the algorithm incorporates song meta data from existing songs, such as `artists`, `generes`, and `songtypes`. Thus, it is important to manage and add potential genres and song types via your library settings upfront. Further, try to keep all your songs meta data up to date and correct incorrectly recognized data immediately after uploading. Otherwise, you run the risk that the algorithm will apply the incorrectly recognized data from already uploaded songs to new uploads as well.

## Song Meta Data

### Artists

MusicShare keeps an internal pool of all artist names used by songs of your library and shares. If you remove an artist from a song and the artist is not used by any other song anymore, it will disappear from the artist pool. The same happens for leaving or joining shares. In the end, all offered artist by the auto completion is just a snapshot of all aggregated artist names of songs you have access to.

### Genres

In contrast to artists, genres are a fixed list you can manage. Via your library settings `Meta Data` tab you can add new generes, edit existing ones, or deleted them. However, if you edit or remove genres, those changes are not reflected to songs which already have a reference to that modified genre.

### Song Types

Song Types are managed in the same way as genres, and are a fixed list you can manage via your library settings `Meta Data` tab. Changes are not reflected to songs which already have a reference to that modified song type.

<img src="https://musicshare-public.s3.eu-central-1.amazonaws.com/edit_library_meta_data.png" width="400">

## Share Management

### Inviting new members

Since MusicShare keeps the number of external service dependencies to a minimum, it doesn't make use of transactional emails. Thus, inviting new share members works via invitation link. Simply issue a new invitation link and sent it to a specific person. If the invited person accepts your request and successfully submits a registration, they are automatically added to the share.

At this point it is worth mentioning that you can also revoke invitations, as long as the person has not yet accepted the invitation.

### Member Permissions

Managing certain access rights of share members works via a small permission management.

-   `share:owner` is the owner of a share and can perform all actions, including deleting a share
-   `playlist:create` is allowed to create share playlists
-   `playlist:modify` is allowed to rename a playlist
-   `playlist:mutate_songs` is allowed to reorder playlists songs
-   `song:upload` **deprecated**
-   `song:modify` **deprecated**

<img src="https://musicshare-public.s3.eu-central-1.amazonaws.com/share_seetings.png" width="400">

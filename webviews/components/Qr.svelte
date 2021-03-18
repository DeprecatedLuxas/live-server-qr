<script lang="ts">
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    onMount(() => {
        vscode.postMessage({
            type: "qr-view-init",
        });
    });
    export let QRCodeUrl: any = "";

    function windowMessage(event: any) {
        const data = event.data;
        switch (data.type) {
            case "QrURL":
                QRCodeUrl = data.message;
        }
    }
</script>

<svelte:window on:message={windowMessage} />

<h2 style="margin: 10px 0; text-align: center">Share via QR Code</h2>

{#if QRCodeUrl.startsWith("data:image/png;base64")}
    <img
        style="display: block; margin: 30px auto;"
        transition:fade={{ duration: 3000 }}
        src={QRCodeUrl}
        alt="QRCode"
    />
    <p style="text-align: center">Scan the QR Code to open your live server on your mobile browser.</p>
{:else if QRCodeUrl !== ""}
    <p>An error occurred when trying to create qr code.</p>
{/if}
